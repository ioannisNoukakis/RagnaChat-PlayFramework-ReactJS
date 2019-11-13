package actors

import akka.actor.{Actor, ActorRef, Props}
import model.{Message, MessageCreate, User}

object ClientActor {
  def props(out: ActorRef, room: ActorRef, user: User) = Props(new ClientActor(out, room, user))

  case class Register(ref: ActorRef, user: User)
  case class Unregister(ref: ActorRef)
  case class PostMessage(ref: ActorRef, message: MessageCreate)
}

class ClientActor(out: ActorRef, room: ActorRef, user: User) extends Actor {
  import actors.ClientActor._

  room ! Register(self, user)

  override def receive: Receive = {
    case messageCreate: MessageCreate => room ! PostMessage(self, messageCreate)
    case message: Message => out ! message
  }

  override def postStop(): Unit = room ! Unregister(self)
}
