# Stage 1 — build do JAR
FROM eclipse-temurin:21-jdk AS builder
WORKDIR /app

COPY pom.xml mvnw ./
COPY .mvn .mvn
# Baixa dependências antes de copiar o código (cache de layer)
RUN ./mvnw dependency:go-offline -q

COPY src src
RUN ./mvnw clean package -DskipTests -q

# Stage 2 — imagem final somente com o JRE
FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8899

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
