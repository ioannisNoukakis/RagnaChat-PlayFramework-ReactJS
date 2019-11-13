package service

import javax.inject.Inject
import model.User
import service.mongodb.MongoDB

class UserPersistenceService @Inject()(mongoDB: MongoDB) extends BasePersistenceService[User](mongoDB) {

}
