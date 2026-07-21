FROM rust:1.97-slim-trixie AS builder
WORKDIR /usr/src/poring
COPY . .
ARG GIT_COMMIT_HASH
RUN GIT_COMMIT_HASH=$GIT_COMMIT_HASH cargo install --path .

FROM debian:trixie-slim
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/poring /usr/local/bin/app
CMD ["app"]
