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

case class GetLast50Messages() extends MessageCMD(MessageCommand.LAST_50_MSG)

object GetLast50Messages {
  implicit val getLast50MessagesReads: Reads[GetLast50Messages] = Json.reads[GetLast50Messages]
}

case class InternalErrorMsg(msg: String, channel: String) extends MessageCMD(MessageCommand.INTERNAL_ERROR_MSG)

// OUT
case class Message(id: String, channel: String, from: UserToken, content: String, date: Date)
