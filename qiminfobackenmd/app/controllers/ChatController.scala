package controllers

import java.util.{Date, UUID}

import actors.{ClientActor, RoomActor}
import play.api.libs.json._
import akka.actor.ActorSystem
import akka.stream.Materializer
import akka.stream.scaladsl.{Flow, Keep, Sink, Source}
import controllers.actions.UserAction
import javax.inject.{Inject, Singleton}
import model.{Message, MessageCreate, User}
import play.api.Configuration
import play.api.libs.streams.ActorFlow
import play.api.mvc.WebSocket.MessageFlowTransformer
import play.api.mvc.{AbstractController, ControllerComponents, WebSocket}
import service.{MessagePersistenceService, UserPersistenceService}

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class ChatController @Inject()(cc: ControllerComponents, config: Configuration, userPersistence: UserPersistenceService, messagePersistenceService: MessagePersistenceService)
                              (implicit system: ActorSystem, mat: Materializer, ec: ExecutionContext)
  extends AbstractController(cc) {

  implicit val messageFormatIn = Json.format[MessageCreate]
  implicit val messageFormatOut = Json.format[Message]
  implicit val messageFlowTransformer = MessageFlowTransformer.jsonMessageFlowTransformer[MessageCreate, Message]

  private val room = system.actorOf(RoomActor.props(messagePersistenceService))

  def wsActor: WebSocket = WebSocket.acceptOrResult[MessageCreate, Message] { request =>
    UserAction.userFromJWTOrResult(request.cookies.get("QimJWT").map(_.value).getOrElse(""), config, userPersistence)
      .recover {
        case e => Right(User(UUID.randomUUID().toString, "anonymous", "-", new Date()))
      }
      .map(_.map { user =>
        ActorFlow.actorRef { out =>
          ClientActor.props(out, room, user)
        }
      })
  }

  def ws: WebSocket = WebSocket.acceptOrResult[MessageCreate, Message] { request =>
    UserAction.userFromJWTOrResult(request.cookies.get("QimJWT").map(_.value).getOrElse(""), config, userPersistence)
      .recover {
        case e => Right(User(UUID.randomUUID().toString, "anonymous", "-", new Date()))
      }
      .map(_.map { user =>
        val source = messagePersistenceService.watchMessage()
        val sink = Flow[MessageCreate]
          .map(mCreate => Message(UUID.randomUUID().toString, user.toUserToken, mCreate.content, new Date()))
          .mapAsync(10)(messagePersistenceService.add(_))
          .toMat(Sink.queue())(Keep.left)
        Flow.fromSinkAndSource(sink, source)
      })
  }

}
