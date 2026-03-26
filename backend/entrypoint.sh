#!/bin/bash
# Preparar caches e inyectar configuraciones
php artisan config:cache
php artisan route:cache

# Ejecutar las migraciones pendientes automáticamente
php artisan migrate --force

# Iniciar el servidor Apache en primer plano
exec apache2-foreground
