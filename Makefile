UNAME:=$(shell uname)
VERSION=0.0.0
export VERSION $$(VERSION)

DATE:=$(shell date +%Y%m%d%H%M%S)
RELEASE_ID_BUILD=${VERSION}+$(DATE)

GO_PATH:=$(shell go env GOPATH)
API_DIR = api
WEB_DIR = front
DEPLOY_DIR = deploy
LINTER_ARGS = run -c .golangci.yml --timeout 5m
CGO_CFLAGS = ""
CMD_FILE=$(CURDIR)/$(API_DIR)/cmd/main.go
BIN_OUTPUT=..
AIR_FILE=cmd/air.toml




.PHONY: help
help:	## Show a list of available commands
	@fgrep -h "##" $(MAKEFILE_LIST) | fgrep -v fgrep | sed -e 's/\\$$//' | sed -e 's/##//'

.PHONY: make-debug
make-debug:	## Debug Makefile itself
	@echo $(UNAME)

.PHONY: install
install:	## Download dependencies
	cd $(API_DIR) && go mod download

.PHONY: download-tools
download-tools:	## Download all required tools to validate and generate documentation, code analysis...
	@echo "Installing tools on $(GO_PATH)/bin"
	go install github.com/golangci/golangci-lint/cmd/golangci-lint@v1.55.1
	go install golang.org/x/tools/cmd/goimports@v0.14.0
	go install github.com/golang/mock/mockgen
	go install github.com/cosmtrek/air@v1.49.0

.PHONY: build-api
build-api:	## Build API go application
	set CGO_ENABLED=0
	cd $(API_DIR) && go build -tags=jsoniter -o $(BIN_OUTPUT) $(CMD_FILE)

.PHONY: build-api-linux
build-api-linux:	## Build API go application for linux
	set CGO_ENABLED=0
	set GOOS=linux
	cd $(API_DIR) && go build -tags=jsoniter -o $(BIN_OUTPUT) $(CMD_FILE)


.PHONY: fmt
fmt:	## Format code
	cd $(API_DIR) && gofmt -w -s .
	cd $(API_DIR) && goimports -w -l .

.PHONY: tidy
tidy:	## Prune any no-longer-needed dependencies from go.mod and add any dependencies needed
	cd $(API_DIR) && go mod tidy -v

.PHONY: lint
lint:	## Run static linting of source files. See .golangci.yml for options
	cd $(API_DIR) && golangci-lint $(LINTER_ARGS)

.PHONY: gen-mocks
gen-mocks:	## Generate code for mocks
	cd $(API_DIR) && go generate ./...

.PHONY: test
test:	## Run tests without required build tags
	cd $(API_DIR) && go test -p 1 -cover -v ./... -timeout 5m

.PHONY: run-api
run-api:	## Run API
	cd $(API_DIR) && CGO_CFLAGS=${CGO_CFLAGS} go run $(CMD_FILE)

.PHONY: run-api-hot
run-api-hot:	## Run API with hot reloading
	cd $(API_DIR) && air -c $(AIR_FILE)

.PHONY: show-version
show-version:	## Shows API version
	@echo $(VERSION)

.PHONY: run-web
run-web:	## Run web app
	cd $(WEB_DIR) && npm start

.PHONY: build-web
build-web:	## Build web app
	cd $(WEB_DIR) && npm run build

.PHONY: build-package
build-package: build-web build-api-linux
	zip back.zip main

.PHONY: deploy
deploy: 
	cd $(DEPLOY_DIR) && terraform init 
	cd $(DEPLOY_DIR) && terraform plan
	cd $(DEPLOY_DIR) && terraform apply
