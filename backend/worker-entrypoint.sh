#!/bin/sh
set -e
chown -R www-data:www-data /var/www/html/var /var/www/html/public
exec "$@"
