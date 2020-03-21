name := "RagnaChatServer"

version := "1.0"

lazy val `ragnachatserver` = (project in file(".")).enablePlugins(PlayScala)

resolvers += "scalaz-bintray" at "https://dl.bintray.com/scalaz/releases"

resolvers += "Akka Snapshot Repository" at "https://repo.akka.io/snapshots/"

scalaVersion := "2.12.10"

libraryDependencies ++= Seq(
  jdbc,
  ehcache,
  ws,
  specs2 % Test,
  guice,
  "org.mongodb.scala" %% "mongo-scala-driver" % "2.9.0",
  "com.pauldijou" %% "jwt-play-json" % "4.2.0",
  "com.roundeights" %% "hasher" % "1.2.0",
  "com.google.api-client" % "google-api-client" % "1.30.7"
)

unmanagedResourceDirectories in Test <+=  baseDirectory ( _ /"target/web/public/test" )

version in Docker := "latest"
maintainer in Docker := "Ioannis Noukakis"
dockerUsername in Docker := Some("ioannisnoukakis9390")
dockerRepository in Docker := Some("docker.io")
packageName in Docker := "ragnachatserver"
daemonUserUid in Docker := None
daemonUser in Docker := "daemon"
dockerBaseImage := "openjdk:11"

javaOptions in Universal ++= Seq(
  // JVM memory tuning
  "-J-Xmx1024m",
  "-J-Xms512m",

  "-Dpidfile.path=/dev/null"
)
