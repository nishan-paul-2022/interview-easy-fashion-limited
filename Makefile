.PHONY: dev install clean build up down prod-up prod-down logs db-setup db-destroy typecheck format lint lint-fix test compile

## Concurrently run all three dev servers
dev:
	docker compose -f infra/docker-compose.dev.yml up -d postgres
	@until docker exec easy-fashion-postgres-dev pg_isready -U postgres >/dev/null 2>&1; do sleep 1; done
	npx dotenv-cli -e .env -- npx --yes concurrently "cross-env PORT=\$$BACKEND_PORT npm run dev --prefix app-backend --if-present" "cross-env PORT=\$$CUSTOMER_PORT npm run dev --prefix app-customer --if-present" "cross-env PORT=\$$MANAGEMENT_PORT npm run dev --prefix app-management --if-present"

## Install dependencies in all three sub-apps
install:
	npm install --legacy-peer-deps
	@if [ -f app-backend/package.json ]; then npm install --prefix app-backend; fi
	@if [ -f app-customer/package.json ]; then npm install --prefix app-customer; fi
	@if [ -f app-management/package.json ]; then npm install --prefix app-management; fi

## Remove node_modules, dist, .next across all apps
clean:
	rm -rf node_modules dist .next
	rm -rf app-backend/node_modules app-backend/dist
	rm -rf app-customer/node_modules app-customer/.next
	rm -rf app-management/node_modules app-management/.next


## Build local dev Docker containers
build:
	docker compose -f infra/docker-compose.dev.yml build

## Start local dev Docker containers
up:
	docker compose -f infra/docker-compose.dev.yml up -d

## Stop local dev Docker containers and free up ports
down:
	docker compose -f infra/docker-compose.dev.yml down
	@echo "Stopping any processes running on ports 3013, 3014, 3015, and 5432..."
	@fuser -k 3013/tcp 3014/tcp 3015/tcp 5432/tcp >/dev/null 2>&1 || true

## Start production Docker containers
prod-up:
	docker compose -f infra/docker-compose.yml up -d

## Stop production Docker containers
prod-down:
	docker compose -f infra/docker-compose.yml down

## View Docker logs
logs:
	docker compose -f infra/docker-compose.dev.yml logs -f

## Run database migrations and seed the database
db-setup:
	npx dotenv-cli -e .env -- sh -c "cd app-backend && npx prisma migrate dev && npx prisma db seed"

## Completely destroy local dev containers and wipe database volumes
db-destroy:
	docker compose -f infra/docker-compose.dev.yml down -v
	@echo "Database volumes destroyed."

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

## Check lint errors in all apps (used by CI)
lint:
	npm run lint
	@if [ -f app-backend/package.json ]; then npm run lint --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run lint --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run lint --prefix app-management --if-present; fi

## Lint all apps and auto-fix errors
lint-fix:
	npm run lint:fix
	@if [ -f app-backend/package.json ]; then npm run lint:fix --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run lint:fix --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run lint:fix --prefix app-management --if-present; fi

## Run tests in all apps
test:
	@echo "Running tests in app-backend..."
	@if [ -f app-backend/package.json ]; then npm run test --prefix app-backend --if-present && npm run test:e2e --prefix app-backend --if-present; fi
	@echo "Running tests in app-customer..."
	@if [ -f app-customer/package.json ]; then npm run test --prefix app-customer --if-present && npm run test:e2e --prefix app-customer --if-present; fi
	@echo "Running tests in app-management..."
	@if [ -f app-management/package.json ]; then npm run test --prefix app-management --if-present && npm run test:e2e --prefix app-management --if-present; fi

## Compile all apps locally
compile:
	@if [ -f app-backend/package.json ]; then npm run build --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run build --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run build --prefix app-management --if-present; fi
