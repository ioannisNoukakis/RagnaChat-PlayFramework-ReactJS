package controllers

import java.util.Date

import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.jackson2.JacksonFactory
import controllers.actions.UserAction
import javax.inject.{Inject, Singleton}
import model.UserToken._
import model.{User, UserGooleAuth}
import pdi.jwt.{JwtAlgorithm, JwtJson}
import play.api.Configuration
import play.api.libs.json.{JsError, JsObject, JsValue, Json}
import play.api.mvc._
import service.implementations.UserPersistenceService
import utils.Constants

import scala.collection.JavaConverters._
import scala.concurrent.{ExecutionContext, Future}

@Singleton
class UserController @Inject()(userAction: UserAction, cc: ControllerComponents, userPersistence: UserPersistenceService, config: Configuration)
                              (implicit ex: ExecutionContext) extends AbstractController(cc) {

  private val verifier = new GoogleIdTokenVerifier.Builder(UserController.googleHTTPtransport, new JacksonFactory())
    // FIXME set a real id.
    .setAudience(List(config.get[String]("google_client_id")).asJava)
    .build()

  // FIXME -> Return JS value?
  def findUser(id: String): Action[AnyContent] = Action.async { _ =>
    userPersistence
      .find("id", id)
      .map {
        case Some(user) => Ok(Json.toJson(user.toUserToken))
        case None => NotFound(Json.obj("status" -> "KO", "message" -> "The requested user does not exists"))
      }
  }

  def auth(): Action[JsValue] = Action.async(parse.json) { implicit request =>
    request.body.validate[UserGooleAuth].fold(
      errors => Future.successful(BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors)))),
      userGoogleAuth => {
        val idToken = verifier.verify(userGoogleAuth.idTokenString);
        if (idToken != null) {
          val payload = idToken.getPayload

          // Print user identifier
          val userId = payload.getSubject
          System.out.println("User ID: " + userId)

          // Get profile information from payload
          val name = payload.get("name").asInstanceOf[String]
          val pictureUrl = payload.get("picture").asInstanceOf[String]

          userPersistence.find("id", userId)
            .flatMap {
              case Some(user) => Future.successful(userAuth(user))
              case None =>
                // create user.
                val user = User(userId, name, new Date(), List("main", "System"), Some(pictureUrl))
                userPersistence
                  .add(user)
                  .map(_ => userAuth(user))
            }.recover {
            case cause => BadRequest(Json.obj("cause" -> cause.getMessage))
          }
        } else {
          Future.successful(Forbidden(Json.obj("status" -> "KO", "message" -> "The idTokenString doesn't match what we have...")))
        }
      })
  }

  /**
   * Checks if the token is still valid
   * This require an authenticated user. See UserAction for more details.
   */
  def check(): Action[AnyContent] = userAction { implicit request =>
    Ok(Json.obj("status" -> "ok", "id" -> request.user.id))
  }

  private def userAuth(user: User) = Ok(Json.obj("status" -> "ok", "id" -> user.id)).withCookies(Cookie(Constants.JWT_COOKIE_NAME, encodeToken(user)))

  private def encodeToken(user: User) = JwtJson.encode(Json.toJson(user.toUserToken).as[JsObject], config.get[String]("jwt_secret"), JwtAlgorithm.HS512)
}

object UserController {
  val googleHTTPtransport: NetHttpTransport = GoogleNetHttpTransport.newTrustedTransport()
}
