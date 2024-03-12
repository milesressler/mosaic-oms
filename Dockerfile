FROM openjdk:17-jdk-alpine
COPY /build/libs/mosaic-oms-*.jar /opt/mosaic/mosaic-oms.jar
EXPOSE 8085
WORKDIR /opt/mosaic
ENTRYPOINT ["java", "-jar", "mosaic-oms.jar"]
