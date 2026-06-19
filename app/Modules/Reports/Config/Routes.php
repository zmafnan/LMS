<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/reports', ['filter' => 'jwt'], function($routes) {
    $routes->get('/', '\Modules\Reports\Controllers\ReportsController::index');
});
