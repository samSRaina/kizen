FROM alpine
WORKDIR /app

COPY shared ./shared
COPY build/ticket-service ./build/ticket-service

ENTRYPOINT ["build/ticket-service"]
