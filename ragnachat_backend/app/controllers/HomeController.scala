package controllers

import javax.inject._
import play.api.Configuration
import play.api.libs.json.Json
import play.api.mvc._

@Singleton
class HomeController @Inject()(cc: ControllerComponents, config: Configuration) extends AbstractController(cc) {

  def index: Action[AnyContent] = Action {
    Ok(Json.obj("ragnachat" -> "CHAT, INSECT", "revision" -> config.get[String]("version")))
  }
}
