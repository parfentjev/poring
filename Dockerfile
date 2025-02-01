FROM golang:latest AS builder
WORKDIR /build
COPY go.mod ./go.mod
COPY go.sum ./go.sum
RUN go mod download
COPY ./internal ./internal
COPY ./main.go ./main.go
RUN GOOS=linux go build -a -installsuffix cgo -o godrop .

FROM debian:bookworm-slim
RUN apt-get update
RUN apt-get install -y ca-certificates
RUN rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/godrop /usr/local/bin/godrop

CMD [ "godrop" ]
