FROM php:8.2-apache

# Actualizar e instalar dependencias básicas y de base de datos
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    libzip-dev \
    zip unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql pgsql gd zip

# Habilitar el módulo de reescritura de Apache
RUN a2enmod rewrite

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar el directorio activo
WORKDIR /var/www/html

# Cambiar el DocumentRoot de Apache a la carpeta /public de Laravel
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Copiar todos los archivos del backend
COPY . /var/www/html

# Instalar dependencias del framework optimizadas para producción
RUN composer install --no-dev --optimize-autoloader

# Asegurar permisos correctos para que Laravel guarde caché y logs
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Copiar el script de inicio y darle permisos
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Al arrancar el contenedor, ejecutar el punto de entrada
CMD ["/usr/local/bin/entrypoint.sh"]
