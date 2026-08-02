.PHONY: lint build

lint:
	tsc --noEmit

build:
	podman build -t poring:latest .
	rm -rf poring.tar
	podman save -o poring.tar poring:latest
