package model

import java.util.Date
import play.api.libs.json.{Json, Reads, Writes}

case class User(
                 id: String,
                 name: String,
                 created: Date,
                 channels: List[String],
                 pictureUrl: Option[String]=None,
               ) {
  def toUserToken: UserToken = UserToken(id, name, created, pictureUrl)
}

case class UserToken(id: String, name: String, created: Date, pictureUrl: Option[String] = None)

object UserToken {
  implicit val userTokenReads: Reads[UserToken] = Json.reads[UserToken]
  implicit val userTokenWrites: Writes[UserToken] = Json.writes[UserToken]
}

case class UserGooleAuth(idTokenString: String)

object UserGooleAuth {
  implicit val userGooleAuthReads: Reads[UserGooleAuth] = Json.reads[UserGooleAuth]
  implicit val userGooleAuthWrites: Writes[UserGooleAuth] = Json.writes[UserGooleAuth]
}
