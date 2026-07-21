.PHONY: fmt lint build

fmt:
	cargo fmt

lint:
	cargo clippy --all

build:
	podman build --build-arg GIT_COMMIT_HASH=$$(git rev-parse --short HEAD) -t poring:latest .
	rm poring.tar
	podman save -o poring.tar poring:latest

