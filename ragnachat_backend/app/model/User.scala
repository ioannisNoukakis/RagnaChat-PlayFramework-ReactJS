package model

import java.util.Date

import play.api.libs.json.{Json, Reads, Writes}

case class User(id: String, username: String, password: String, created: Date, channels: Array[String]) {
  def toUserToken: UserToken = UserToken(id, username, created)
}

case class UserAuth(username: String, password: String)

object UserAuth {
  implicit val userAuthReads: Reads[UserAuth] = Json.reads[UserAuth]
  implicit val userAuthWrites: Writes[UserAuth] = Json.writes[UserAuth]
}

case class UserToken(id: String, username: String, created: Date)

object UserToken {
  implicit val userTokenReads: Reads[UserToken] = Json.reads[UserToken]
  implicit val userTokenWrites: Writes[UserToken] = Json.writes[UserToken]
}
