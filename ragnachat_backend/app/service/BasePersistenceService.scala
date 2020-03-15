package service

import akka.NotUsed
import akka.stream.scaladsl.Source
import javax.inject.Singleton
import org.mongodb.scala.bson.conversions.Bson
import org.mongodb.scala.model.Filters._
import org.mongodb.scala.model.Aggregates._
import org.mongodb.scala.{Completed, MongoCollection, SingleObservable}
import service.mongodb.MongoDB

import scala.concurrent.{ExecutionContext, Future}
import scala.reflect.ClassTag


@Singleton
abstract class BasePersistenceService[T: ClassTag](mongoDB: MongoDB, tableName: Option[String] = None) {
  protected val collection: MongoCollection[T] = mongoDB.database.getCollection[T](tableName.getOrElse(implicitly[ClassTag[T]].runtimeClass.getName))

  def find(key: String, value: String)(implicit ec: ExecutionContext): Future[Option[T]] = _find(filter = Some(equal(key, value)))
    .map(_.headOption)

  def find(dfilter: Bson)(implicit ec: ExecutionContext): Future[Option[T]] = _find(filter = Some(dfilter))
    .map(_.headOption)

  def page(skip: Int, limit: Int)(implicit ec: ExecutionContext): Future[Seq[T]] = _find(skip = Some(skip), limit = Some(limit))

  def pageAggregate(aggregatePipeline: Seq[Bson], s: Int, l: Int): Source[Seq[T], NotUsed] = Source.fromFuture(collection
    .aggregate(aggregatePipeline ++ Seq(skip(s), limit(l)))
    .toFuture())

  def add(value: T)(implicit ec: ExecutionContext): Future[Completed] = collection
    .insertOne(value)
    .toFuture()

  def watch(): Source[T, NotUsed] = Source.fromPublisher(MongoDB.observableToPublisher(collection.watch()))
    .map(_.getFullDocument)

  def watch(aggregatePipeline: Seq[Bson]): Source[T, NotUsed] = Source.fromPublisher(MongoDB.observableToPublisher(collection.watch(aggregatePipeline)))
    .map(_.getFullDocument)

  def initializeIndexes: SingleObservable[String]

  protected def _find(filter: Option[Bson] = None, skip: Option[Int] = None, limit: Option[Int] = None)(implicit ec: ExecutionContext): Future[Seq[T]] = {
    filter
      .map(collection.find(_))
      .getOrElse(collection.find())
      .skip(skip.getOrElse(0))
      .limit(skip.getOrElse(1))
      .toFuture()
  }
}
