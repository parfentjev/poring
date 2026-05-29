FROM rust:1.96.0-slim-trixie AS builder
WORKDIR /usr/src/poring
COPY . .
RUN cargo install --path .

FROM debian:trixie-slim
COPY --from=builder /usr/local/cargo/bin/poring /usr/local/bin/app
CMD ["app"]
