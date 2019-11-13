package model

import java.util.Date

case class MessageCreate(content: String)

case class Message(id: String, from: UserToken, content: String, date: Date)
