package service

import akka.NotUsed
import akka.stream.scaladsl.Source
import javax.inject.Inject
import model.Message
import org.mongodb.scala.model.Aggregates._
import org.mongodb.scala.model.Sorts._
import org.mongodb.scala.model.Filters._
import service.mongodb.MongoDB


class MessagePersistenceService @Inject()(mongoDB: MongoDB) extends BasePersistenceService[Message](mongoDB) {

  def watchMessage(channels: Array[String]): Source[Message, NotUsed] = super.watch(Seq(
    filter(equal("channel", channel))
  ))

  def pageMessage(channels: String, skip: Int, limit: Int): Source[Message, NotUsed] = super.pageAggregate(Seq(
    filter(equal("channel", channel)),
    sort(orderBy(descending("date")))
  ), skip, limit)
    .flatMapConcat(elements => Source(elements.reverse.toList))
}
