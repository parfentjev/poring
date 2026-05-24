FROM rust:1.95.0-slim-trixie AS builder
WORKDIR /usr/src/poring
COPY . .
RUN cargo install --path .

FROM alpine:latest
COPY --from=builder /usr/local/cargo/bin/poring /usr/local/bin/app
CMD ["app"]
