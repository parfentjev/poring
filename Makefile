.PHONY: build
build:
	docker buildx use container-builder
	docker buildx build --target adapter --platform linux/arm64 -t poring-adapter:latest --output type=docker,dest=adapter.tar .

.PHONY: push
push:
	rsync adapter.tar ${VPS_USER}@${VPS_HOST}:${VPS_PUSH_PATH}
	rm adapter.tar
