package controllers

import java.util.{Date, UUID}

import akka.NotUsed
import akka.actor.ActorSystem
import akka.stream.{FlowShape, Materializer}
import akka.stream.scaladsl._
import controllers.actions.UserAction
import javax.inject.{Inject, Singleton}
import model.{GetLast50Messages, InternalErrorMsg, Message, MessageCMD, MessageCommand, MessageCreate, User, UserToken}
import play.api.Configuration
import play.api.libs.json._
import play.api.mvc.WebSocket.MessageFlowTransformer
import play.api.mvc.{AbstractController, ControllerComponents, WebSocket}
import service.{MessagePersistenceService, UserPersistenceService}
import utils.Constants

import scala.concurrent.ExecutionContext

@Singleton
class ChatController @Inject()(cc: ControllerComponents, config: Configuration, userPersistence: UserPersistenceService, messagePersistenceService: MessagePersistenceService)
                              (implicit system: ActorSystem, mat: Materializer, ec: ExecutionContext)
  extends AbstractController(cc) {

  implicit private val messageFormatIn: OFormat[JsValue] = Json.format[JsValue]
  implicit private val messageFormatOut: OFormat[Message] = Json.format[Message]
  implicit private val messageFlowTransformer: MessageFlowTransformer[JsValue, Message]
  = MessageFlowTransformer.jsonMessageFlowTransformer[JsValue, Message]

  private def flowGraph(user: User) = Flow.fromGraph(GraphDSL.create() { implicit b =>
    import GraphDSL.Implicits._

    // message transformer
    val transformer = Flow[JsValue]
      .map(v => (v \ "cmd").asOpt
        .map {
          case MessageCommand.CREATE_MSG => v.as[MessageCreate]
          case MessageCommand.LAST_50_MSG => v.as[GetLast50Messages]
          case _ => InternalErrorMsg(s"Cannot parse message: ${(v \ "cmd").get}", "System")
        }
        .getOrElse(InternalErrorMsg("Missing required cmd attribute.", "System"))
      )

    // prepare graph elements
    val input = b.add(Flow[JsValue])
    val broadcast = b.add(Broadcast[MessageCMD](3))
    val merge = b.add(Merge[Message](4))

    // event processors
    val messageCreate = Flow[MessageCMD]
      .filter(_.cmd == MessageCommand.CREATE_MSG)
      .map(_.asInstanceOf[MessageCreate])
      .map(mCreate => Message(UUID.randomUUID().toString, mCreate.channel, user.toUserToken, mCreate.content, new Date()))
      .mapAsync[Message](5)(msg => messagePersistenceService.add(msg).map(_ => msg))

    val getLast50Messages = Flow[MessageCMD]
      .filter(_.cmd == MessageCommand.LAST_50_MSG)
      .map(_.asInstanceOf[GetLast50Messages])
      .flatMapConcat(_ => messagePersistenceService.pageMessage(user.channels, 0, 50))

    val processErrorMessages = Flow[MessageCMD]
      .filter(_.cmd == MessageCommand.INTERNAL_ERROR_MSG)
      .map(_.asInstanceOf[InternalErrorMsg])
      .map(e => Message("SYSTEM", e.channel, UserToken("SYSTEM", "System", new Date()), e.msg, new Date()))

    // connect the graph
    input ~> transformer ~> broadcast ~> messageCreate        ~> merge
                            broadcast ~> getLast50Messages    ~> merge
                            broadcast ~> processErrorMessages ~> merge
    messagePersistenceService.watchMessage(user.channels)     ~> merge

    // expose ports
    FlowShape(input.in, merge.out)
  })

  def ws: WebSocket = WebSocket.acceptOrResult[JsValue, Message] { request =>
    UserAction
      .userFromJWTOrResult(request.cookies.get(Constants.JWT_COOKIE_NAME).map(_.value).getOrElse(""), config, userPersistence)
      .recover {
        case _ => Right(User(UUID.randomUUID().toString, "anonymous", "-", new Date(), List("main", "System")))
      }
      .map(_.map(user => flowGraph(user)))
  }

}
