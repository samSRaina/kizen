FROM golang:1.27-alpine

WORKDIR /app

RUN apk add --no-cache git curl && \
    go install github.com/air-verse/air@latest

# Download modules
COPY go.mod go.sum ./
RUN go mod download

# Copy application source
COPY . .

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]
