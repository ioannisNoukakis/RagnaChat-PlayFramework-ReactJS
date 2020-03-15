import com.google.inject.AbstractModule
import service.PersistenceServiceEagerSingleton

class EagerLoaderModule extends AbstractModule {
  override def configure(): Unit = {
    bind(classOf[PersistenceServiceEagerSingleton]).asEagerSingleton()
  }
}
