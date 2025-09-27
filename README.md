# Request Inbox

![CI/CD](https://github.com/jesusnoseq/request-inbox/actions/workflows/deploy_app.yaml/badge.svg)
![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)
![Go Version](https://img.shields.io/badge/Go-1.24+-00ADD8?logo=go)
![Node Version](https://img.shields.io/badge/Node-20+-339933?logo=node.js)
![AWS](https://img.shields.io/badge/AWS-Lambda%20%7C%20DynamoDB-orange?logo=aws)

A web application to collect and inspect HTTP requests for testing and debugging purposes. Request Inbox provides a simple and free alternative to services like webhook.site and webhookinbox.com.

🔗 **Try it live at [request-inbox.com](https://request-inbox.com/)**

## ✨ Features

### Core Functionality

- 📬 **Create, list, and delete inboxes** - Organize your inboxes
- 🎯 **Endpoint collection** - Capture HTTP requests with detailed information
- 🔧 **Custom responses** - Configure response headers and body content
- 👀 **Request inspection** - View detailed request information including headers, body, and metadata
- 🗑️ **Request management** - Remove requests from an inbox

### User Experience

- 🌓 **Light and dark themes** - Choose your preferred interface style
- 🔍 **Inbox search** - Quickly find your inboxes
- ♻️ **Auto-refresh** - Real-time request updates
- 📖 **JSON viewer** - Pretty-print and inspect request bodies
- 📊 **OpenAPI documentation** - Complete API specification

### Security & Access

- 👤 **User authentication** - Secure login with GitHub and Google OAuth
- 🔒 **Private inboxes** - Control access to your testing environments
- 🔑 **API keys** - Programmatic access to your inboxes

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Go 1.24+ (for local development)
- Node.js 20+ (for local development)

### Using Docker Compose (Recommended)

Run the complete application stack with an embedded database:

```bash
docker-compose -f docker-compose-local.yml up --build
```

This will start:

- **API server** on `http://localhost:8080`
- **Frontend** on `http://localhost:3000`

### Local Development

1. **Backend setup:**

```bash
cd api
make install          # Download Go dependencies
make run-api-hot      # Start with hot reloading
```

1. **Frontend setup:**

```bash
cd front
npm install           # Install dependencies
npm start            # Start development server
```

1. **View all available commands:**

```bash
make help
```

## 🏗️ Architecture

### Technology Stack

- **Backend**: Go 1.24+ with Gin web framework. Can also work as an AWS lambda.
- **Frontend**: React 18 with TypeScript and Material-UI
- **Database**: BadgerDB (embedded) for local development, DynamoDB for production
- **Infrastructure**: Terraform on AWS (Lambda, API Gateway, S3, CloudFront)
- **Authentication**: JWT with OAuth2 (GitHub, Google)
- **Monitoring**: PostHog analytics

### Deployment

- **Development**: Local Docker containers
- **Production**: Serverless AWS infrastructure with CI/CD via GitHub Actions

## Project Structure

```text
request-inbox/
├── .github/workflows/       # CI/CD pipelines (GitHub Actions)
├── api/                     # Backend application (Go)
│   ├── cmd/                 # Application entry points
│   ├── pkg/                 # Shared packages and business logic
│   │   ├──  handler/        # HTTP request handlers
│   │   ├──  model/          # Data models and validation
│   │   ├──  database/       # Database abstraction layer
│   │   ├──  login/          # Authentication & authorization
│   │   └──  route/          # API route definitions
│   ├── go.mod               # Go module dependencies
│   └── air.toml             # Hot reload configuration
├── front/                   # Frontend application (React + TypeScript)
│   ├── src/                 # Source code
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Application pages
│   │   ├── services/        # API client services
│   │   └── types/           # TypeScript type definitions
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies
│   └── tsconfig.json        # TypeScript configuration
├── deploy/                  # Infrastructure as Code (Terraform)
│   ├── back.tf              # Backend infrastructure
│   ├── front.tf             # Frontend infrastructure
│   ├── cert.tf              # SSL certificates
│   └── variables.tf         # Configuration variables
├── docs/                    # Documentation
│   └── openapi.yaml         # API specification (OpenAPI 3.1)
├── docker-compose-local.yml # Local development environment
├── Dockerfile-api           # Backend container definition
├── Dockerfile-front         # Frontend container definition
├── Makefile                 # Development commands
└── README.md                # This file
```

## 📚 API Documentation

Our REST API is documented using OpenAPI 3.1 specification:

- **Online**: [API Documentation](https://request-inbox.com/docs)
- **Source**: [OpenAPI YAML](./docs/openapi.yaml)

### Base URLs

- **Production**: `https://api.request-inbox.com/api/v1`
- **Local Development**: `http://localhost:8080/api/v1`

## 📄 Template Docs

Responses can work as golang templates is the response is mark as dynamic.

[Template documentation](https://request-inbox.com/docs)

## 🛠️ Development

### Available Make Commands

```bash
make help               # Show all commands
```

### Environment Variables

For local development, create `.env.development` in the `api/` directory:

```bash
# Database
DB_ENGINE=embedded

# Server
API_HTTP_PORT=8080
API_MODE=server

# CORS
CORS_ALLOW_ORIGINS=http://localhost:3000

# Authentication (optional for local development)
LOGIN_GITHUB_CLIENT_ID=your_github_client_id
LOGIN_GITHUB_CLIENT_SECRET=your_github_client_secret
LOGIN_GOOGLE_CLIENT_ID=your_google_client_id
LOGIN_GOOGLE_CLIENT_SECRET=your_google_client_secret
JWT_SECRET=your_jwt_secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow Go best practices and run `make lint` and `make test`
- Write tests for new functionality
- Update documentation for API changes
- Use conventional commit messages

## 📄 License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🗺️ Roadmap

### Planned Features

- **Alerts**: Notification system for new requests
- **Import/Export**: Inbox configuration backup and restore fromt github
- **Testing**: Request testing capabilities. Mark request as Pass or Fail
- **Limits**: Configurable request and inbox limits

### Future Enhancements

- WebSocket support for real-time updates
- Custom domain support for inboxes
- Advanced filtering and search
- Request callback/passthrough
- Performance monitoring and metrics
- Docker images
