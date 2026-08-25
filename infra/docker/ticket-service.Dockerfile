FROM alpine
WORKDIR /app

COPY shared ./shared
COPY build/tickets-service ./build/ticket-service

ENTRYPOINT ["app/build/ticket-service"]
