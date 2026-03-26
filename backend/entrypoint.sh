#!/bin/bash
# Ejecutar las migraciones pendientes automáticamente
php artisan migrate --force

# Optimizar solo rutas (no config, para que env vars de Render funcionen en tiempo real)
php artisan route:cache
php artisan view:cache

# Iniciar el servidor Apache en primer plano
exec apache2-foreground
