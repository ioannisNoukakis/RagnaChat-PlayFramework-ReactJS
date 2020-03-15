package controllers

import java.util.{Date, UUID}

import scala.concurrent.duration._
import akka.actor.ActorSystem
import akka.stream.{FlowShape, Materializer}
import akka.stream.scaladsl._
import controllers.actions.UserAction
import javax.inject.{Inject, Singleton}
import model.{GetLastXMessages, InternalErrorMsg, Message, MessageCMD, MessageCommand, MessageCreate, User, UserToken}
import play.api.Configuration
import play.api.libs.json._
import play.api.mvc.WebSocket.MessageFlowTransformer
import play.api.mvc.{AbstractController, ControllerComponents, WebSocket}
import service.implementations.{MessagePersistenceService, UserPersistenceService}
import utils.Constants

import scala.concurrent.ExecutionContext

@Singleton
class ChatController @Inject()(cc: ControllerComponents, config: Configuration, userPersistence: UserPersistenceService, messagePersistenceService: MessagePersistenceService)
                              (implicit system: ActorSystem, mat: Materializer, ec: ExecutionContext)
  extends AbstractController(cc) {

  implicit private val messageFormatOut: OFormat[Message] = Json.format[Message]
  implicit private val messageFlowTransformer: MessageFlowTransformer[JsValue, Message]
  = MessageFlowTransformer.jsonMessageFlowTransformer[JsValue, Message]

  private def flowGraph(user: User) = Flow.fromGraph(GraphDSL.create() { implicit b =>
    import GraphDSL.Implicits._

    // message transformer
    val transformer = Flow[JsValue]
      .map(v => MessageCommand.valueOf((v \ "cmd").as[String]) match {
          case MessageCommand.CREATE_MSG => v.as[MessageCreate]
          case MessageCommand.LAST_X_MSG => v.as[GetLastXMessages]
          case _ => InternalErrorMsg(s"Cannot parse message: ${(v \ "cmd").get}", "System")
        }
      )

    // prepare graph elements
    val throttle = b.add(Flow[JsValue].throttle(5, 1.second))
    val broadcast = b.add(Broadcast[MessageCMD](3))
    val merge = b.add(Merge[Message](5))

    // event processors
    val messageCreate = Flow[MessageCMD]
      .filter(_.cmd == MessageCommand.CREATE_MSG)
      .map(_.asInstanceOf[MessageCreate])
      .map(mCreate => Message(
        UUID.randomUUID().toString,
        mCreate.channel,
        user.toUserToken,
        if (mCreate.content.length > Constants.MESSAGE_MAX_LENGTH) mCreate.content.substring(0, Constants.MESSAGE_MAX_LENGTH) else mCreate.content,
        new Date()))
      .mapAsync[Message](5)(msg => messagePersistenceService.add(msg).map(_ => msg))

    val getLast50Messages = Flow[MessageCMD]
      .filter(_.cmd == MessageCommand.LAST_X_MSG)
      .map(_.asInstanceOf[GetLastXMessages])
      .flatMapConcat(_ => messagePersistenceService.pageMessage(user.channels, 0, 50))

    val processErrorMessages = Flow[MessageCMD]
      .filter(_.cmd == MessageCommand.INTERNAL_ERROR_MSG)
      .map(_.asInstanceOf[InternalErrorMsg])
      .map(e => Message("SYSTEM", e.channel, UserToken("SYSTEM", "System", new Date()), e.msg, new Date()))

    val watchMsg = messagePersistenceService.watchMessage(user.channels)
        .filter(_.from.id != user.id)

    // connect the graph
    throttle ~> transformer ~> broadcast ~> messageCreate                                              ~> merge
                               broadcast ~> getLast50Messages                                          ~> merge
                               broadcast ~> processErrorMessages                                       ~> merge
    watchMsg                                                                                           ~> merge
    Source.single(Message("RDY", "System", UserToken("SYSTEM", "System", new Date()), "", new Date())) ~> merge

    // expose ports
    FlowShape(throttle.in, merge.out)
  })

  def ws: WebSocket = WebSocket.acceptOrResult[JsValue, Message] { request =>
    val a = request.cookies.get(Constants.JWT_COOKIE_NAME)
    UserAction
      .userFromJWTOrResult(request.cookies.get(Constants.JWT_COOKIE_NAME).map(_.value).getOrElse(""), config, userPersistence)
      .recover {
        case _ => Right(User(UUID.randomUUID().toString, "anonymous", new Date(), List("main", "System")))
      }
      .map(_.map(user => flowGraph(user)))
  }

}
