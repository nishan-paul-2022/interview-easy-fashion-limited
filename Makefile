.PHONY: install dev lint format test build docker-up docker-down docker-logs clean migrate seed

## Install dependencies in all three sub-apps
install:
	npm install --legacy-peer-deps
	@if [ -f app-backend/package.json ]; then npm install --prefix app-backend; fi
	@if [ -f app-customer/package.json ]; then npm install --prefix app-customer; fi
	@if [ -f app-management/package.json ]; then npm install --prefix app-management; fi

## Concurrently run all three dev servers
dev:
	docker compose -f infra/docker-compose.dev.yml up -d postgres
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker exec easy-fashion-postgres-dev pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
	@echo "PostgreSQL is ready! Starting dev servers..."
	npx dotenv-cli -e .env -- npx --yes concurrently "cross-env PORT=\$$BACKEND_PORT npm run dev --prefix app-backend --if-present" "cross-env PORT=\$$CUSTOMER_PORT npm run dev --prefix app-customer --if-present" "cross-env PORT=\$$MANAGEMENT_PORT npm run dev --prefix app-management --if-present"

## Run database migrations
migrate:
	npx dotenv-cli -e .env -- sh -c "cd app-backend && npx prisma migrate dev"

## Seed the database
seed:
	npx dotenv-cli -e .env -- sh -c "cd app-backend && npx prisma db seed"

## Lint all apps
lint:
	npm run lint
	@if [ -f app-backend/package.json ]; then npm run lint --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run lint --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run lint --prefix app-management --if-present; fi

## Fix lint errors in all apps
lint-fix:
	npm run lint:fix
	@if [ -f app-backend/package.json ]; then npm run lint:fix --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run lint:fix --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run lint:fix --prefix app-management --if-present; fi

## Run TypeScript type checking in all apps
typecheck:
	@if [ -f app-backend/package.json ]; then npm run typecheck --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run typecheck --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run typecheck --prefix app-management --if-present; fi

## Format code in all apps
format:
	npm run format
	@if [ -f app-backend/package.json ]; then npm run format --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run format --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run format --prefix app-management --if-present; fi

## Run tests in all apps
test:
	@echo "Running tests in app-backend..."
	@if [ -f app-backend/package.json ]; then npm run test --prefix app-backend --if-present && npm run test:e2e --prefix app-backend --if-present; fi
	@echo "Running tests in app-customer..."
	@if [ -f app-customer/package.json ]; then npm run test --prefix app-customer --if-present && npm run test:e2e --prefix app-customer --if-present; fi
	@echo "Running tests in app-management..."
	@if [ -f app-management/package.json ]; then npm run test --prefix app-management --if-present && npm run test:e2e --prefix app-management --if-present; fi

## Build all apps
build:
	@if [ -f app-backend/package.json ]; then npm run build --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run build --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run build --prefix app-management --if-present; fi

## Start local dev Docker containers
docker-dev-up:
	docker compose -f infra/docker-compose.dev.yml up -d

## Alias for starting local dev Docker containers
docker-up: docker-dev-up

## Stop local dev Docker containers
docker-down:
	docker compose -f infra/docker-compose.dev.yml down

## Start production Docker containers
docker-prod-up:
	docker compose -f infra/docker-compose.yml up -d

## Stop production Docker containers
docker-prod-down:
	docker compose -f infra/docker-compose.yml down

## View Docker logs
docker-logs:
	docker compose -f infra/docker-compose.dev.yml logs -f

## Remove node_modules, dist, .next across all apps
clean:
	rm -rf node_modules dist .next
	rm -rf app-backend/node_modules app-backend/dist
	rm -rf app-customer/node_modules app-customer/.next
	rm -rf app-management/node_modules app-management/.next
