<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/dashboard', ['filter' => 'jwt'], function($routes) {
    $routes->get('/', '\Modules\Dashboard\Controllers\DashboardController::index');
});
