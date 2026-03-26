FROM php:8.2-apache

# Actualizar e instalar dependencias básicas y de base de datos
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libzip-dev \
    zip unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql pgsql gd zip

# Habilitar el módulo de reescritura de Apache y headers
RUN a2enmod rewrite headers

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar el directorio activo
WORKDIR /var/www/html

# Cambiar el DocumentRoot de Apache a la carpeta /public de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configurar CORS a nivel de Apache (se aplica SIEMPRE, incluso si PHP falla con 500)
RUN echo '<IfModule mod_headers.c>\n\
    SetEnvIf Origin "https://comuni-gas\\.vercel\\.app$" CORS_ORIGIN=$0\n\
    Header set Access-Control-Allow-Origin "%{CORS_ORIGIN}e" env=CORS_ORIGIN\n\
    Header set Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE, OPTIONS" env=CORS_ORIGIN\n\
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With, Accept" env=CORS_ORIGIN\n\
    Header set Access-Control-Allow-Credentials "true" env=CORS_ORIGIN\n\
    Header set Access-Control-Max-Age "3600" env=CORS_ORIGIN\n\
</IfModule>' > /etc/apache2/conf-available/cors.conf \
    && a2enconf cors

# Copiar todos los archivos del backend
COPY . /var/www/html

# Instalar dependencias del framework optimizadas para producción ignorando candados de versión de Sail
RUN composer install --no-dev --optimize-autoloader --ignore-platform-reqs

# Asegurar permisos correctos para que Laravel guarde caché y logs
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Copiar el script de inicio y darle permisos
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Al arrancar el contenedor, ejecutar el punto de entrada
CMD ["/usr/local/bin/entrypoint.sh"]
