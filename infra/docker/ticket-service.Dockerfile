FROM alpine
WORKDIR /app

COPY shared ./shared
COPY build/ticket-service ./build/ticket-service

ENTRYPOINT ["/app/build/ticket-service"]
