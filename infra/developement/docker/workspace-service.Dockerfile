FROM golang:1.26-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /app/workspace-service ./services/workspace-service/cmd

FROM alpine
WORKDIR /app
COPY --from=build /app/workspace-service ./

ENTRYPOINT ["/app/workspace-service"]
