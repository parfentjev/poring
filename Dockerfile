FROM maven:3.9.11-eclipse-temurin-25-alpine AS builder
WORKDIR /app

COPY pom.xml ./pom.xml
COPY shared/pom.xml ./shared/pom.xml
COPY adapter/pom.xml ./adapter/pom.xml
COPY worker/pom.xml ./worker/pom.xml
RUN mvn dependency:go-offline -ntp

COPY shared/src ./shared/src
COPY adapter/src ./adapter/src
COPY worker/src ./worker/src
RUN mvn clean package -ntp -q

FROM maven:3.9.11-eclipse-temurin-25-alpine AS adapter
WORKDIR /app

COPY --from=builder /app/adapter/target/adapter.jar .
CMD ["java", "-jar", "adapter.jar"]

FROM maven:3.9.11-eclipse-temurin-25-alpine AS worker
WORKDIR /app

COPY --from=builder /app/worker/target/worker.jar .
CMD ["java", "-jar", "worker.jar"]
