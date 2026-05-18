.PHONY: dev build typecheck test test-file test-coverage migrate migrate-rollback seed seed-one truncate install up down logs shell

COMPOSE = docker compose -f ../docker-compose.yml
EXEC    = $(COMPOSE) exec app

dev:
	$(COMPOSE) up -d

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f app

shell:
	$(EXEC) sh

typecheck:
	$(EXEC) yarn typecheck

test:
	$(EXEC) yarn test

test-file:
	$(EXEC) yarn test $(files)

test-coverage:
	$(EXEC) yarn test:coverage

migrate:
	$(EXEC) yarn migrate

migrate-rollback:
	$(EXEC) yarn migrate rollback

seed:
	$(EXEC) yarn seed

seed-one:
	$(EXEC) yarn seed:one $(seeder)

truncate:
	$(EXEC) yarn truncate

install:
	$(EXEC) yarn add $(package)
