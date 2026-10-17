# -----------------------------------------------------------------------------
# Stage 1: Build static binary
# -----------------------------------------------------------------------------
FROM golang:1.27-alpine AS builder

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .

# Compile fully static binary:
# - CGO_ENABLED=0: Disable cgo for pure Go portable binary
# - -trimpath: Remove local filesystem paths from binary
# - -ldflags="-s -w": Strip symbol table and DWARF debug information
RUN CGO_ENABLED=0 GOOS=linux go build \
    -trimpath \
    -ldflags="-s -w" \
    -o /app/bin/server ./cmd/server

# -----------------------------------------------------------------------------
# Stage 2: Development with live reload (target: development)
# -----------------------------------------------------------------------------
FROM golang:1.27-alpine AS development

WORKDIR /app

RUN apk add --no-cache git curl && \
    go install github.com/air-verse/air@latest

COPY go.mod go.sum ./
RUN go mod download

COPY . .

EXPOSE 8080

CMD ["air", "-c", ".air.toml"]

# -----------------------------------------------------------------------------
# Stage 3: Minimal production runtime (target: production / default)
# -----------------------------------------------------------------------------
FROM gcr.io/distroless/static-debian12:nonroot AS production

WORKDIR /app

COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo
COPY --from=builder --chown=nonroot:nonroot /app/bin/server /app/server

EXPOSE 8080

USER nonroot:nonroot

ENTRYPOINT ["/app/server"]
