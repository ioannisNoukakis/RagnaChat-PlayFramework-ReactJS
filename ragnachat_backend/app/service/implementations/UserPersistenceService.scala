package service.implementations

import javax.inject.Inject
import model.User
import org.mongodb.scala.SingleObservable
import org.mongodb.scala.model.IndexOptions
import org.mongodb.scala.model.Sorts.ascending
import service.BasePersistenceService
import service.mongodb.MongoDB

class UserPersistenceService @Inject()(mongoDB: MongoDB) extends BasePersistenceService[User](mongoDB) {
  override def initializeIndexes: SingleObservable[String] = collection.createIndex(ascending("id"), IndexOptions().background(false).unique(true))
}
