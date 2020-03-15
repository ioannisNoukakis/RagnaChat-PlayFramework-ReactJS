package controllers.actions

import java.time.Clock

import javax.inject.Inject
import model.User
import pdi.jwt.exceptions.JwtLengthException
import pdi.jwt.{JwtAlgorithm, JwtJson}
import play.api.Configuration
import play.api.libs.json._
import play.api.mvc._
import service.implementations.UserPersistenceService
import utils.Constants

import scala.concurrent.{ExecutionContext, Future}

case class AuthenticatedRequest[A](user: User, request: Request[A]) extends WrappedRequest[A](request)

class UserAction @Inject()(override val parser: BodyParsers.Default, userPersistence: UserPersistenceService, config: Configuration)(implicit val ec: ExecutionContext)
  extends ActionBuilder[AuthenticatedRequest, AnyContent] with ActionRefiner[Request, AuthenticatedRequest] {

  private implicit val clock: Clock = Clock.systemUTC

  override def refine[A](request: Request[A]): Future[Either[Result, AuthenticatedRequest[A]]] =
    UserAction.userFromJWTOrResult(request.cookies.get(Constants.JWT_COOKIE_NAME).map(_.value).getOrElse(""), config, userPersistence)
      .map(_.map(AuthenticatedRequest(_, request)))
      .recover {
        case e => e.printStackTrace(); Left(Results.Unauthorized(Json.obj("status" -> "KO", "message" -> "Something failed. In doubt, your request was denied.")))
      }

  override protected def executionContext: ExecutionContext = ec
}

object UserAction {
  def userFromJWTOrResult[A](json: String, config: Configuration, userPersistenceService: UserPersistenceService)
                            (implicit ec: ExecutionContext): Future[Either[Result, User]] = (for {
    decodedJwt <- Future {
      JwtJson.decodeJson(json, config.get[String]("jwt_secret"), Seq(JwtAlgorithm.HS512)).get
    }
    matchingUsers <- userPersistenceService.find("id", (decodedJwt \ "id").as[String])
    result <- Future {
      matchingUsers
        .map(user => Right(user))
        .getOrElse(Left(Results.Forbidden(Json.obj("status" -> "KO", "message" -> "Invalid auth."))))
    }
  } yield result)
    .recover{
      case _: JwtLengthException => Left(Results.Forbidden(Json.obj("status" -> "KO", "message" -> "Auth is malformed.")))
      case _ => Left(Results.Forbidden(Json.obj("status" -> "KO", "message" -> "Something went wrong. In doubt, cancelling your request.")))
    }
}
