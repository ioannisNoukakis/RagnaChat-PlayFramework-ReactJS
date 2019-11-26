package model

import java.util.Date

case class MessageCreate(channel: String, content: String)

case class Message(id: String, channel: String, from: UserToken, content: String, date: Date)
