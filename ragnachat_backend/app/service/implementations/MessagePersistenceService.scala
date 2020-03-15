package service.implementations

import akka.NotUsed
import akka.stream.scaladsl.Source
import javax.inject.Inject
import model.Message
import org.mongodb.scala.SingleObservable
import org.mongodb.scala.bson._
import org.mongodb.scala.model.Aggregates._
import org.mongodb.scala.model.IndexOptions
import org.mongodb.scala.model.Sorts._
import service.BasePersistenceService
import service.mongodb.MongoDB


class MessagePersistenceService @Inject()(mongoDB: MongoDB) extends BasePersistenceService[Message](mongoDB) {

  def watchMessage(channels: List[String]): Source[Message, NotUsed] = super.watch(Seq(
    Document("$match" -> Document("fullDocument.channel" -> Document("$in" -> channels)))
  ))

  def pageMessage(channels: List[String], skip: Int, limit: Int): Source[Message, NotUsed] = super.pageAggregate(Seq(
    Document("$match" -> Document("channel" -> Document("$in" -> channels))),
    sort(orderBy(descending("date")))
  ), skip, limit)
    .flatMapConcat(elements => Source(elements.reverse.toList))

  override def initializeIndexes: SingleObservable[String] = collection.createIndex(ascending("id", "channel"), IndexOptions().background(false).unique(true))
}
