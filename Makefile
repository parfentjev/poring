.PHONY: build
build:
	docker build -t godrop:latest .
	docker save godrop:latest > godrop-latest.tar

.PHONY: push
push:
	rsync godrop-latest.tar root@${VPS_HOST}:/home/godrop/
