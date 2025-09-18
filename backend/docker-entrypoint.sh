#!/bin/sh
set -e
#chown -R www-data:www-data /var/www/html/var /var/www/html/public
#php bin/console-php cache:clear --env=prod
#php bin/console-php cache:warmup --env=prod
#php bin/console-php doctrine:migrations:migrate --no-interaction --env=prod
#exec "$@"

# ensure the dirs you actually mounted or need are writable
mkdir -p /var/www/html/var/log

chown -R www-data:www-data /var/www/html/var/log \
                          /var/www/html/public

# optionally run migrations (env var toggle)
if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  php bin/console-php doctrine:migrations:migrate \
      --no-interaction --env=${APP_ENV:-prod}
fi

exec "$@"
