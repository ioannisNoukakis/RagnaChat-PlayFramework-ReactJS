package controllers

import java.util.{Date, UUID}

import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl.{Flow, Keep, Sink}
import controllers.actions.UserAction
import javax.inject.{Inject, Singleton}
import model.{Message, MessageCreate, User}
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

  implicit private val messageFormatIn: OFormat[MessageCreate] = Json.format[MessageCreate]
  implicit private val messageFormatOut: OFormat[Message] = Json.format[Message]
  implicit private val messageFlowTransformer: MessageFlowTransformer[MessageCreate, Message]
    = MessageFlowTransformer.jsonMessageFlowTransformer[MessageCreate, Message]

  def ws: WebSocket = WebSocket.acceptOrResult[MessageCreate, Message] { request =>
    UserAction
      .userFromJWTOrResult(request.cookies.get(Constants.JWT_COOKIE_NAME).map(_.value).getOrElse(""), config, userPersistence)
      .recover {
        case _ => Right(User(UUID.randomUUID().toString, "anonymous", "-", new Date(), List("main")))
      }
      .map(_.map { user =>
        val source = messagePersistenceService.pageMessage(user.channels, 0, 50)
          .concat(messagePersistenceService.watchMessage(user.channels))
        val sink = Flow[MessageCreate]
          .map(mCreate => Message(UUID.randomUUID().toString, mCreate.channel, user.toUserToken, mCreate.content, new Date()))
          .mapAsync(1)(messagePersistenceService.add(_))
          .toMat(Sink.queue())(Keep.left)
        Flow.fromSinkAndSource(sink, source)
      })
  }

}
