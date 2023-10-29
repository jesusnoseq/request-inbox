# syntax=docker/dockerfile:1

FROM dockerhub-proxy/library/golang:1.21-alpine3.18 AS builder

RUN apk update && \
    apk add --no-cache --no-progress \
    ca-certificates \
    bash \
    gcc \
    make \
    musl-dev \
    curl \
    tar \
    tzdata \
    && rm -rf /var/cache/apk/* && update-ca-certificates

COPY Makefile Makefile
RUN make download-tools

COPY api/go.mod api/go.sum ./api/
RUN make install

COPY . /github.com/jesusnoseq/request-inbox/

CMD ["make", "help"]