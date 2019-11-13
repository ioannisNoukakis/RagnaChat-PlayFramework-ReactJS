package service.mongodb

import java.util.concurrent.atomic.AtomicBoolean

import javax.inject.Singleton
import model.{Message, User, UserToken}
import org.bson.codecs.configuration.CodecRegistries.{fromProviders, fromRegistries}
import org.mongodb.scala.bson.codecs.DEFAULT_CODEC_REGISTRY
import org.mongodb.scala.bson.codecs.Macros._
import org.mongodb.scala.{MongoClient, MongoDatabase}
import org.mongodb.{scala => mongoDB}
import org.{reactivestreams => rxStreams}

import scala.language.implicitConversions


@Singleton
class MongoDB {
  private val mongoClient = MongoClient("mongodb://localhost:27018")
  private val codecRegistry = fromRegistries(
    fromProviders(classOf[User]),
    fromProviders(classOf[UserToken]),
    fromProviders(classOf[Message]),
    DEFAULT_CODEC_REGISTRY
  )

  val database: MongoDatabase = mongoClient.getDatabase("QimChat").withCodecRegistry(codecRegistry)
}

object MongoDB {

  implicit def observableToPublisher[T](observable: mongoDB.Observable[T]): rxStreams.Publisher[T] = ObservableToPublisher(observable)

  case class ObservableToPublisher[T](observable: mongoDB.Observable[T]) extends rxStreams.Publisher[T] {
    def subscribe(subscriber: rxStreams.Subscriber[_ >: T]): Unit = {
      observable.subscribe(
        new mongoDB.Observer[T]() {
          override def onSubscribe(subscription: mongoDB.Subscription): Unit = {
            subscriber.onSubscribe(new rxStreams.Subscription() {
              private final val cancelled: AtomicBoolean = new AtomicBoolean

              def request(n: Long) {
                if (!subscription.isUnsubscribed && n < 1) {
                  subscriber.onError(new IllegalArgumentException(
                    """3.9 While the Subscription is not cancelled,
                      |Subscription.request(long n) MUST throw a java.lang.IllegalArgumentException if the
                      |argument is <= 0.""".stripMargin
                  ))
                } else {
                  subscription.request(n)
                }
              }

              def cancel() {
                if (!cancelled.getAndSet(true)) subscription.unsubscribe()
              }
            })
          }

          def onNext(result: T): Unit = subscriber.onNext(result)

          def onError(e: Throwable): Unit = subscriber.onError(e)

          def onComplete(): Unit = subscriber.onComplete()
        }
      )
    }
  }

}
