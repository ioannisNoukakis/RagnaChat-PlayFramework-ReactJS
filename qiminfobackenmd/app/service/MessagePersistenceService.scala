package service

import akka.NotUsed
import akka.stream.scaladsl.Source
import javax.inject.Inject
import model.Message
import org.mongodb.scala.model.Aggregates._
import org.mongodb.scala.model.Sorts._
import service.mongodb.MongoDB


class MessagePersistenceService @Inject()(mongoDB: MongoDB) extends BasePersistenceService[Message](mongoDB) {
  def watchMessage(): Source[Message, NotUsed] = super.watch()

  def pageMessage(skip: Int, limit: Int): Source[Message, NotUsed] = super.pageAggregate(Seq(
    sort(orderBy(descending("date")))
  ), skip, limit)
    .flatMapConcat(elements => Source(elements.reverse.toList))
}
