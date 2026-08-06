.PHONY: install dev lint format test build docker-up docker-down docker-logs clean

## Install dependencies in all three sub-apps
install:
	npm install --legacy-peer-deps
	@if [ -f app-backend/package.json ]; then npm install --prefix app-backend; fi
	@if [ -f app-customer/package.json ]; then npm install --prefix app-customer; fi
	@if [ -f app-management/package.json ]; then npm install --prefix app-management; fi

## Concurrently run all three dev servers
dev:
	npx --yes concurrently "npm run dev --prefix app-backend --if-present" "npm run dev --prefix app-customer --if-present" "npm run dev --prefix app-management --if-present"

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
	@if [ -f app-backend/package.json ]; then npm run test --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run test --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run test --prefix app-management --if-present; fi

## Build all apps
build:
	@if [ -f app-backend/package.json ]; then npm run build --prefix app-backend --if-present; fi
	@if [ -f app-customer/package.json ]; then npm run build --prefix app-customer --if-present; fi
	@if [ -f app-management/package.json ]; then npm run build --prefix app-management --if-present; fi

## Start Docker containers
docker-up:
	docker compose -f infra/docker-compose.yml up -d

## Stop Docker containers
docker-down:
	docker compose -f infra/docker-compose.yml down

## View Docker logs
docker-logs:
	docker compose -f infra/docker-compose.yml logs -f

## Remove node_modules, dist, .next across all apps
clean:
	rm -rf node_modules dist .next
	rm -rf app-backend/node_modules app-backend/dist
	rm -rf app-customer/node_modules app-customer/.next
	rm -rf app-management/node_modules app-management/.next
