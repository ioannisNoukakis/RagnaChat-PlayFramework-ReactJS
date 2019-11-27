package controllers

import java.util.{Date, UUID}

import com.roundeights.hasher.Implicits._
import controllers.actions.UserAction
import javax.inject.{Inject, Singleton}
import model.UserAuth._
import model.UserToken._
import model.{User, UserAuth}
import pdi.jwt.{JwtAlgorithm, JwtJson}
import play.api.Configuration
import play.api.libs.json.{JsError, JsObject, JsValue, Json}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents, Cookie}
import service.UserPersistenceService
import utils.Constants

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class UserController @Inject()(userAction: UserAction, cc: ControllerComponents, userPersistence: UserPersistenceService, config: Configuration)
                              (implicit ex: ExecutionContext) extends AbstractController(cc) {

  def addUser(): Action[JsValue] = Action.async(parse.json) { implicit request =>
    request.body.validate[UserAuth].fold(
      errors => Future.successful(BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors)))),
      userCreate => {
        val user = User(UUID.randomUUID().toString, userCreate.username, userCreate.password.sha512.hex, new Date(), List("main"))

        userPersistence
          .find("username", userCreate.username)
          .map(_.isEmpty)
          .flatMap { usernameFree =>
            if (usernameFree) {
              userPersistence
                .add(user)
                .map(_ => userAuth(user))
            } else {
              Future.successful(Conflict(Json.obj("status" -> "KO", "message" -> "Username already taken")))
            }
          }

      })
  }

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
    val result = request.body.validate[UserAuth]
    result.fold(
      errors => Future.successful(BadRequest(Json.obj("status" -> "KO", "message" -> JsError.toJson(errors)))),
      tmpU => {
        userPersistence.find("username", tmpU.username)
          .map(_.get)
          .map(user => if (user.password == tmpU.password.sha512.hex) {
            userAuth(user);
          } else {
            Forbidden(Json.obj("cause" -> "Invalid password or username"))
          }).recover {
          case _: UnsupportedOperationException => Forbidden(Json.obj("reason" -> "Invalid password or username"))
          case cause => BadRequest(Json.obj("cause" -> cause.getMessage))
        }
      }
    )
  }

  /**
   * Checks if the token is still valid
   * This require an authenticated user. See UserAction for more details.
   */
  def check(): Action[AnyContent] = userAction { implicit request =>
    Ok(Json.obj("status" -> "ok", "user" -> request.user.toUserToken))
  }

  private def userAuth(user: User) = Ok(Json.obj("status" -> "ok", "id" -> user.id)).withCookies(Cookie(Constants.JWT_COOKIE_NAME, encodeToken(user)))

  private def encodeToken(user: User) = JwtJson.encode(Json.toJson(user.toUserToken).as[JsObject], config.get[String]("jwt_secret"), JwtAlgorithm.HS512)
}
