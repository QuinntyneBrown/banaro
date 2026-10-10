FROM php:8.3-cli-bookworm
RUN apt-get update && apt-get install -y --no-install-recommends git unzip libpq-dev libzip-dev libicu-dev \
    && docker-php-ext-install pdo_pgsql pgsql zip intl pcntl bcmath opcache \
    && pecl install redis && docker-php-ext-enable redis \
    && rm -rf /var/lib/apt/lists/*
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
# opcache for the CLI server too; timestamps are rechecked every 2 s, so edits apply almost at once.
RUN { \
      echo 'opcache.enable=1'; \
      echo 'opcache.enable_cli=1'; \
      echo 'opcache.validate_timestamps=1'; \
      echo 'opcache.revalidate_freq=2'; \
    } > /usr/local/etc/php/conf.d/opcache-dev.ini
WORKDIR /app
