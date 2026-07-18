FROM docker.io/library/golang:1.26.5-alpine AS builder
WORKDIR /src

ARG GIT_COMMIT_HASH

COPY go.mod go.sum ./
RUN go mod download
COPY main.go ./
COPY internal ./internal

RUN CGO_ENABLED=0 go build \
	-trimpath \
	-ldflags="-s -w -X codeberg.org/parfentjev/poring/internal/metadata.Version=${GIT_COMMIT_HASH}" \
	-o /poring \
	.

FROM docker.io/library/debian:trixie-slim
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

COPY --from=builder /poring /poring

USER 65532:65532

ENTRYPOINT ["/poring"]
