FROM gradle:8.10.2-jdk21 AS builder

WORKDIR /workspace

COPY build.gradle.kts settings.gradle.kts gradle.properties wrapper-bootstrap.gradle.kts ./
COPY gradle ./gradle
COPY src ./src

RUN gradle bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

ENV JAVA_OPTS=""

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /workspace/build/libs/*.jar /app/core-platform.jar

EXPOSE 8080

CMD ["sh", "-c", "java $JAVA_OPTS -jar /app/core-platform.jar"]
