.PHONY: build
build:
	docker buildx build --platform=linux/arm64 -t godrop:latest .
	docker save godrop:latest > godrop-latest.tar
	rsync godrop-latest.tar aleksei@{$RPI_HOST}:/home/aleksei/services/godrop/
