# RequestInbox

Web Application to collects HTTP request for testing purposes.

It tries to replace [webhookinbox.com](http://webhookinbox.com/)

## Quick start

### Docker Compose

Execute back and front applications with in an embeded DB

```sh
docker-compose -f docker-compose.yml up --build
```

### Makefile

There is also a `Makefile` that allows to excute multiple commands easily

```sh
make help
```

## Tech stack

* Back → Golang (Gin). Expose a simple REST API
* Front → React + Material UI. UI for listing request inboxs and requests made to an inbox.
* IaC → Terraform?

## API doc

Check our [OpenAPI 3.1](https://github.com/jesusnoseq/request-inbox/blob/main/docs/openapi.yaml) specification

## Basic repository structure

```
request-inbox
├─ .github/workflows → contains pipelines to execute, build and deploy applications
├─ docs → contains documentation related files
├─ front → frontend application
│  ├─ src → source code
│  ├─ public → static assets
│  ├─ tsconfig.json → typescript configuration
│  └─ package.json → frontend dependencies
├─ back → backend application
│  ├─ cmd → entry points for go application
│  ├─ pkg → shared packages
│  ├─ .golangci.yaml → golang linter configuration
│  └─ go.mod → backend dependencies
├─ Makefile → contains commands for back and front applications
├─ docker-compose.yml → run the working environment of the application
└── Readme.md → this file. Contains basic documentation about the project
```

## TODO

* Add DynamoDB
* Add front
* Search inbox
* Edit inbox
* Deployment
* Authentication
