<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/auth', function($routes) {
    $routes->post('login', '\Modules\Users\Controllers\UsersController::login');
    $routes->get('health', '\Modules\Users\Controllers\UsersController::health');
});

$routes->group('api/users', ['filter' => 'jwt'], function($routes) {
    $routes->get('profile', '\Modules\Users\Controllers\UsersController::profile');
    $routes->post('profile', '\Modules\Users\Controllers\UsersController::updateProfile');
    $routes->get('/', '\Modules\Users\Controllers\UsersController::index');
    $routes->post('/', '\Modules\Users\Controllers\UsersController::store');
    $routes->put('(:num)', '\Modules\Users\Controllers\UsersController::update/$1');
    $routes->delete('(:num)', '\Modules\Users\Controllers\UsersController::delete/$1');
});
