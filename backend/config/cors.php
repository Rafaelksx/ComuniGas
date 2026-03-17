<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This configuration is used by the built-in CORS middleware (HandleCors).
    | It controls what origins, methods and headers are allowed when the
    | frontend (Next.js) running on a different port tries to call the API.
    |
    | IMPORTANT: Because the frontend uses `axios` with `withCredentials: true`,
    | we must allow credentials and respond with a specific origin (not '*').
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    // Allowed HTTP methods for CORS requests
    'allowed_methods' => ['*'],

    // Allowed origins (frontend origin). Use env to keep it configurable.
    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],

    // Use patterns if you need wildcard support like https://*.example.com
    'allowed_origins_patterns' => [],

    // Allowed headers that can be sent in the request
    'allowed_headers' => ['*'],

    // Headers that are allowed to be exposed to the browser
    'exposed_headers' => [],

    // How long the results of a preflight request can be cached
    'max_age' => 0,

    // Whether or not the response can be shared when requesting with credentials
    'supports_credentials' => true,
];
