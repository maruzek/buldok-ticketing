#!/bin/zsh

# docker compose down worker

# docker compose exec backend php bin/console-php doctrine:query:sql "TRUNCATE TABLE messenger_messages"

# docker compose down

echo "INFO: Gracefully stopping the worker container..."
docker-compose exec worker php bin/console-php messenger:stop-workers

echo "INFO: Shutting down and removing all containers..."
docker-compose down

echo "✅ Shutdown complete. The message queue is now empty."