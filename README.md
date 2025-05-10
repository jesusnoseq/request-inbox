# RequestInbox

Web Application to collects HTTP request for testing purposes.

It tries to replace [webhookinbox.com](http://webhookinbox.com/) and be a simpler alternative to [webhook.site](http://webhook.site)

You can try it at [request-inbox.com](https://request-inbox.com/)

## Quick start

### Docker Compose

Execute back and front applications with in an embeded DB

```sh
docker-compose -f docker-compose.yml -f docker-compose-local.yml up --build
```

### Makefile

There is also a `Makefile` that allows to excute multiple commands easily

```sh
make help
```

## Tech stack

* Back → Golang (Gin). Expose a simple REST API
* Front → React + Material UI. UI for listing request inboxs and requests made to an inbox.
* IaC → Terraform (AWS)

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
├─ deploy → terraform code to deploy infrastructure
│  ├─ .tflint.hlc → tflint linter configuration
│  ├─ back.tf → backend infra
│  ├─ cert → certificates related infra
│  ├─ front → frontend related infra
│  └─ variables.tf → varaibles related to the deployment to customize
├─ Makefile → contains commands for back and front applications
├─ docker-compose.yml → run the working environment of the application
└── Readme.md → this file. Contains basic documentation about the project
```

## Features

* Create, list and delete inboxes
* Endpoint that collects request
* Change respose header and body
* List request of an inbox
* Remove request of an inbox
* Request body viewer
* Light and dark themes
* Open API documentation
* Inbox search
* Request auto refresh
* Users & Authentication
* Private inboxes
* API keys

## TODO

* Request on response
  * Measure time
* Request test
* Response time
* Dynamic response
* Response conditions
* File viewer
* Limits
  * Request
  * Inbox
  * Refresh time
* Alerts
* Export request
* Export & import inbox
