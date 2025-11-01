.PHONY: build
build:
	docker buildx use container-builder
	docker buildx build --target adapter --platform linux/arm64 -t poring-adapter:latest --output type=docker,dest=adapter.tar .
	docker buildx build --target worker --platform linux/arm64 -t poring-worker:latest --output type=docker,dest=worker.tar .

.PHONY: push
push:
	rsync adapter.tar ${VPS_USER}@${VPS_HOST}:${VPS_PUSH_PATH}
	rsync worker.tar ${VPS_USER}@${VPS_HOST}:${VPS_PUSH_PATH}
	rm adapter.tar worker.tar
