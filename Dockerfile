# syntax=docker/dockerfile:1

# Stage 1: Build Frontend
FROM node:18 AS frontend-builder

WORKDIR /app/front

# Copy frontend package files and install dependencies
COPY front/package*.json ./
RUN npm install

# Copy frontend source and build
COPY docs/* ../docs/
COPY front/ ./

RUN npm run build

# Stage 2: Build Backend
FROM golang:1.24-alpine3.21 AS backend-builder

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
    git \
    && rm -rf /var/cache/apk/* && update-ca-certificates

WORKDIR /github.com/jesusnoseq/request-inbox/

# Copy Makefile and install tools
COPY Makefile Makefile
RUN make download-tools

# Copy Go module files and download dependencies
COPY api/go.mod api/go.sum ./api/
RUN cd api && go mod download

# Copy API source code
COPY api ./api

# Build the API
RUN cd api && CGO_ENABLED=0 GOOS=linux go build -tags=jsoniter -ldflags="-w -s" -o main cmd/main.go

# Stage 3: Final Runtime Image
FROM nginx:1.29.1-alpine

RUN apk --no-cache add ca-certificates tzdata supervisor && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Copy backend binary from builder
COPY --from=backend-builder /github.com/jesusnoseq/request-inbox/api/main ./api

# Copy frontend build to nginx html directory
COPY --from=frontend-builder /app/front/build /usr/share/nginx/html

# Create directory for embedded database
RUN mkdir -p /app/data && \
    chown -R nginx:nginx /app/data

# Copy nginx configuration
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Serve static files
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to Go backend
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Serve OpenAPI docs
    location /docs {
        try_files \$uri \$uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

# Create entrypoint script that generates supervisord config with environment variables
RUN printf '#!/bin/sh\n\
cat > /etc/supervisord.conf <<SUPERVISORD_EOF\n\
[supervisord]\n\
nodaemon=true\n\
user=root\n\
logfile=/var/log/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:nginx]\n\
command=nginx -g '"'"'daemon off;'"'"'\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
autorestart=true\n\
priority=10\n\
\n\
[program:api]\n\
command=/app/api\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
autorestart=true\n\
priority=20\n\
environment=API_MODE="${API_MODE}",API_HTTP_PORT="${API_HTTP_PORT}",DB_ENGINE="${DB_ENGINE}",DB_BADGER_PATH="${DB_BADGER_PATH}",GIN_MODE="${GIN_MODE}",CORS_ALLOW_ORIGINS="${CORS_ALLOW_ORIGINS}",ENABLE_PRINT_CONFIG="${ENABLE_PRINT_CONFIG}",ENABLE_CALLBACK_URL_VALIDATION="${ENABLE_CALLBACK_URL_VALIDATION}",ENABLE_LISTING_PUBLIC_INBOX="${ENABLE_LISTING_PUBLIC_INBOX}"\n\
SUPERVISORD_EOF\n\
\n\
exec /usr/bin/supervisord -c /etc/supervisord.conf\n' > /entrypoint.sh && \
chmod +x /entrypoint.sh

# Expose ports 80 (nginx) and 8080 (Go API)
EXPOSE 80 8080

# Override nginx entrypoint and run our script
ENTRYPOINT ["/entrypoint.sh"]
CMD []
