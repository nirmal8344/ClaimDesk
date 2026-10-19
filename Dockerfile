# Root Dockerfile for Render and Container Deployments
# Multi-stage build for Spring Boot Backend
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Copy pom.xml and resolve dependencies
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source code
COPY backend/src ./src

# Build JAR package
RUN mvn clean package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

RUN addgroup -S claimdesk && adduser -S claimdesk -G claimdesk
RUN mkdir -p /app/uploads && chown -R claimdesk:claimdesk /app

COPY --from=builder --chown=claimdesk:claimdesk /app/target/*.jar /app/app.jar

USER claimdesk

EXPOSE 8080 10000

ENV SPRING_PROFILES_ACTIVE=prod \
    FILE_UPLOAD_DIR=/app/uploads

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-8080}/api/health || exit 0

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -XX:+UseContainerSupport -Dserver.port=${PORT:-8080} -Dserver.address=0.0.0.0 -jar /app/app.jar"]
