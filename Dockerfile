FROM amazoncorretto:17
COPY /build/libs/mosaic-oms-*.jar /opt/mosaic/mosaic-oms.jar
EXPOSE 8080
WORKDIR /opt/mosaic
ENTRYPOINT ["java", "-jar", "mosaic-oms.jar"]
