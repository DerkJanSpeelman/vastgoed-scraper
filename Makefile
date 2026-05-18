.PHONY: up down logs shell ps

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

shell:
	docker compose exec app sh

ps:
	docker compose ps
