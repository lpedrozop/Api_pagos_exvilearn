FROM ubuntu:latest
LABEL authors="luksp"

ENTRYPOINT ["top", "-b"]