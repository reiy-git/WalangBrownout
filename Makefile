.PHONY: setup up down restart logs backend-shell frontend-shell migrate

# First-time project setup
setup:
	docker compose up -d --build
	docker compose exec backend php artisan key:generate
	docker compose exec backend php artisan migrate

# Start containers in background
up:
	docker compose up -d

# Stop all containers
down:
	docker compose down

# Rebuild and restart containers
restart:
	docker compose down
	docker compose up -d --build

# View live container logs
logs:
	docker compose logs -f

# SSH / Shell into Laravel Backend container
backend-shell:
	docker compose exec backend bash

# SSH / Shell into React Frontend container
frontend-shell:
	docker compose exec frontend sh

# Run database migrations
migrate:
	docker compose exec backend php artisan migrate