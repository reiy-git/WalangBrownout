.PHONY: setup up down restart logs backend-shell frontend-shell migrate seed

# First-time project setup
setup:
	docker compose up -d --build
	docker compose exec backend composer install --no-interaction --prefer-dist
	docker compose exec backend sh -c 'if grep -q "^APP_KEY=$$" .env || grep -q "^APP_KEY=\"\"$$" .env; then php artisan key:generate; else echo "Preserving existing APP_KEY"; fi'
	docker compose exec backend php artisan migrate --force

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
	docker compose exec backend php artisan migrate --force

# Load local demo accounts and inventory (never use against production)
seed:
	docker compose exec backend php artisan db:seed --force