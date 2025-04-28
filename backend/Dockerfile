# Use an official PHP image with Apache
FROM php:8.2-apache

ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Install PHP extensions and other dependencies needed for Symfony
RUN apt-get update && apt-get install -y \
    libicu-dev \
    libpq-dev \
    libonig-dev \
    zip \
    unzip \
  && docker-php-ext-install intl pdo pdo_pgsql opcache

# ENV APACHE_DOCUMENT_ROOT /var/www/html/public

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/bin --filename=composer

# Enable Apache mod_rewrite for Symfony’s routing
RUN a2enmod rewrite

#RUN docker-php-ext-install zip bcmath pdo pdo_mysql

# Copy custom PHP configuration (optional)
# COPY ./php.ini /usr/local/etc/php/

###> recipes ###
###< recipes ###

# Set working directory (adjust if needed)
WORKDIR /var/www/html

# Expose port 80 (the default Apache port)
EXPOSE 80
