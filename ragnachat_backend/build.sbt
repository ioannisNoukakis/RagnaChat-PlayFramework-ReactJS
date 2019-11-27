name := "RagnaChatServer"

version := "1.0"

lazy val `qimchatserver` = (project in file(".")).enablePlugins(PlayScala)

resolvers += "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases"

resolvers += "Akka Snapshot Repository" at "https://repo.akka.io/snapshots/"

scalaVersion := "2.12.10"

libraryDependencies ++= Seq(
  jdbc,
  ehcache,
  ws,
  specs2 % Test,
  guice,
  "org.mongodb.scala" %% "mongo-scala-driver" % "2.6.0",
  "com.pauldijou" %% "jwt-play-json" % "4.2.0",
  "com.roundeights" %% "hasher" % "1.2.0"
)

unmanagedResourceDirectories in Test <+=  baseDirectory ( _ /"target/web/public/test" )

