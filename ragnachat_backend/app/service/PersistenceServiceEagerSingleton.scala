package service

import javax.inject.{Inject, Singleton}
import service.implementations.{MessagePersistenceService, UserPersistenceService}

@Singleton
class PersistenceServiceEagerSingleton @Inject()(messagePersistenceService: MessagePersistenceService, userPersistenceService: UserPersistenceService) {
  List(messagePersistenceService.initializeIndexes, userPersistenceService.initializeIndexes).foreach(obs => obs.subscribe(
    (index: String) => println(index),
    (e: Throwable) => println(s"There was an error upon creating index: $e")
  ))
}
