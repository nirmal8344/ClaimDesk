# Build Stage
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /app

# Cache dependency layer
COPY pom.xml ./
RUN mvn dependency:go-offline -B

# Copy application source
COPY src ./src

# Build production artifact without running integration tests during Docker image build
RUN mvn clean package -DskipTests -B

# Runtime Stage
FROM eclipse-temurin:17-jre-alpine AS runner

WORKDIR /app

# Create non-privileged user and group
RUN addgroup -S claimdesk && adduser -S claimdesk -G claimdesk

# Create uploads directory and set permissions
RUN mkdir -p /app/uploads && chown -R claimdesk:claimdesk /app

# Copy packaged jar from builder
COPY --from=builder --chown=claimdesk:claimdesk /app/target/*.jar /app/app.jar

USER claimdesk

EXPOSE 10000

ENV PORT=10000 \
    SPRING_PROFILES_ACTIVE=prod \
    FILE_UPLOAD_DIR=/app/uploads

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-10000}/api/health || exit 0

ENTRYPOINT ["sh", "-c", "exec java -Djava.security.egd=file:/dev/./urandom -XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:InitialRAMPercentage=50.0 -Xss512k -XX:+TieredCompilation -XX:TieredStopAtLevel=1 -jar /app/app.jar --server.port=${PORT:-10000} --server.address=0.0.0.0"]
