FROM alpine
WORKDIR /app

# removed the shared directory for the time being
# COPY shared ./shared
COPY build/ticket-service ./build/ticket-service

ENTRYPOINT ["/app/build/ticket-service"]
