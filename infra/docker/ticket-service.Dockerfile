FROM golang:1.26-alpine AS build

WORKDIR /src

# Copy module files first to cache dependency downloads
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the application
COPY . .

# Build the binary explicitly resolving from context root
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/ticket-service ./services/ticket-service/cmd

FROM alpine
WORKDIR /app

COPY --from=build /app/ticket-service ./

ENTRYPOINT ["/app/ticket-service"]
