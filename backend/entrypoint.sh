#!/bin/bash
# Preparar caches e inyectar configuraciones ambientales de Docker a la aplicacion web
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar las migraciones pendientes automáticamente
php artisan migrate --force

# Restaurar permisos al usuario de Apache (www-data) justo antes de levantar el servidor web
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Iniciar el servidor Apache en primer plano
exec apache2-foreground
