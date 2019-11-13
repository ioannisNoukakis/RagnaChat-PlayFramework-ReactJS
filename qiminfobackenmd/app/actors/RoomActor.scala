package actors

import java.util.{Date, UUID}

import akka.actor.{Actor, ActorRef, Props}
import model.{Message, MessageCreate, User, UserToken}
import service.MessagePersistenceService

import scala.concurrent.ExecutionContext
import scala.util.{Failure, Success}

object RoomActor {
  def props(messagePersistenceService: MessagePersistenceService) = Props(new RoomActor(messagePersistenceService))
}

class RoomActor(messagePersistenceService: MessagePersistenceService) extends Actor {

  import actors.ClientActor._

  implicit val ec: ExecutionContext = context.dispatcher

  def withUsers(clients: Map[ActorRef, User]): Receive = {
    case Register(ref: ActorRef, user: User) =>
      println("New client connected!", ref, user.toUserToken)
      messagePersistenceService.pageMessage(0, 50)
        .map(messages => messages.foreach(ref ! _))
        .onComplete {
          case Success(_) => context.become(withUsers(clients + (ref -> user)))
          case Failure(e) => handleError(ref, e)
        }
    case Unregister(ref: ActorRef) =>
      println("Client disconnected!", ref)
      context.become(withUsers(clients - ref))
    case PostMessage(ref: ActorRef, message: MessageCreate) =>
      val msg = Message(
        UUID.randomUUID().toString,
        clients(ref).toUserToken,
        message.content,
        new Date()
      )
      messagePersistenceService.add(msg).onComplete {
        case Success(_) => clients.keys.foreach(_ ! msg)
        case Failure(e) => handleError(ref, e)
      }
  }

  override def receive: Receive = withUsers(Map())

  private def handleError(ref: ActorRef, e: Throwable)
    = ref ! Message("error", UserToken("SYSTEM", "SYSTEM", new Date()), e.getMessage, new Date())
}
