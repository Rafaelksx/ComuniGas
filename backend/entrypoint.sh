#!/bin/bash
# Preparar caches e inyectar configuraciones ambientales de Docker a la aplicacion web
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar las migraciones pendientes automáticamente
php artisan migrate --force

# Iniciar el servidor Apache en primer plano
exec apache2-foreground
