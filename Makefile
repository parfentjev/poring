.PHONY: build
build:
	docker buildx use container-builder
	docker buildx build --platform linux/arm64 -t godrop:latest --output type=docker,dest=image.tar .

.PHONY: push
push:
	rsync image.tar root@${VPS_HOST}:/home/godrop/
