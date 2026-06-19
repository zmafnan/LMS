<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/discussions', ['filter' => 'jwt'], function($routes) {
    $routes->get('/', '\Modules\Discussions\Controllers\DiscussionsController::index');
    $routes->post('/', '\Modules\Discussions\Controllers\DiscussionsController::store');
});
