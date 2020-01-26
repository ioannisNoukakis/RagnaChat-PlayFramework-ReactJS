package model

import java.util.Date

import play.api.libs.json.{Json, Reads}

// IN
abstract class MessageCMD(messageCommand: MessageCommand) {
  def cmd: MessageCommand = messageCommand
}

case class MessageCreate(channel: String, content: String) extends MessageCMD(MessageCommand.CREATE_MSG)

object MessageCreate {
  implicit val messageCreateReads: Reads[MessageCreate] = Json.reads[MessageCreate]
}

case class GetLastXMessages(nMessages: Int) extends MessageCMD(MessageCommand.LAST_X_MSG)

object GetLastXMessages {
  implicit val getLast50MessagesReads: Reads[GetLastXMessages] = Json.reads[GetLastXMessages]
}

case class InternalErrorMsg(msg: String, channel: String) extends MessageCMD(MessageCommand.INTERNAL_ERROR_MSG)

// OUT
case class Message(id: String, channel: String, from: UserToken, content: String, date: Date)
