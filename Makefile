TOOLS_BIN := $(CURDIR)/.tools/bin
GOLANGCI_LINT := $(TOOLS_BIN)/golangci-lint
GOLANGCI_LINT_VERSION := v2.12.2

.PHONY: init fmt lint build

init:
	mkdir -p $(TOOLS_BIN)
	curl -sSfL https://golangci-lint.run/install.sh | sh -s -- -b $(TOOLS_BIN) $(GOLANGCI_LINT_VERSION)

fmt:
	go fmt ./...

lint:
	$(GOLANGCI_LINT) run

build:
	podman build --build-arg GIT_COMMIT_HASH=$$(git rev-parse --short HEAD) -t poring:latest .
	rm -f poring.tar
	podman save -o poring.tar poring:latest
