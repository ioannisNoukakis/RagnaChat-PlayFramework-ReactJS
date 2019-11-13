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

import scala.concurrent.ExecutionContext

@Singleton
class ChatController @Inject()(cc: ControllerComponents, config: Configuration, userPersistence: UserPersistenceService, messagePersistenceService: MessagePersistenceService)
                              (implicit system: ActorSystem, mat: Materializer, ec: ExecutionContext)
  extends AbstractController(cc) {

  implicit val messageFormatIn = Json.format[MessageCreate]
  implicit val messageFormatOut = Json.format[Message]
  implicit val messageFlowTransformer = MessageFlowTransformer.jsonMessageFlowTransformer[MessageCreate, Message]

  def ws: WebSocket = WebSocket.acceptOrResult[MessageCreate, Message] { request =>
    UserAction
      .userFromJWTOrResult(request.cookies.get("QimJWT").map(_.value).getOrElse(""), config, userPersistence)
      .recover {
        case _ => Right(User(UUID.randomUUID().toString, "anonymous", "-", new Date()))
      }
      .map(_.map { user =>
        val source = messagePersistenceService.pageMessage(0, 50)
          .concat(messagePersistenceService.watchMessage())
        val sink = Flow[MessageCreate]
          .map(mCreate => Message(UUID.randomUUID().toString, user.toUserToken, mCreate.content, new Date()))
          .mapAsync(10)(messagePersistenceService.add(_))
          .toMat(Sink.queue())(Keep.left)
        Flow.fromSinkAndSource(sink, source)
      })
  }

}
