FROM openjdk:11-jdk-slim

WORKDIR /app

COPY sumserver-1.0-SNAPSHOT.jar sumserver.jar

EXPOSE 50052

CMD ["java", "-jar", "sumserver.jar"]
