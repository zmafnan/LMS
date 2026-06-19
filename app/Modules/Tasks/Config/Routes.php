<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/tasks', ['filter' => 'jwt'], function($routes) {
    $routes->get('/', '\Modules\Tasks\Controllers\TasksController::index');
    $routes->post('/', '\Modules\Tasks\Controllers\TasksController::store');
    $routes->get('(:num)', '\Modules\Tasks\Controllers\TasksController::show/$1');
    $routes->put('(:num)', '\Modules\Tasks\Controllers\TasksController::update/$1');
    $routes->delete('(:num)', '\Modules\Tasks\Controllers\TasksController::delete/$1');
    $routes->post('(:num)/upload', '\Modules\Tasks\Controllers\TasksController::upload/$1');
    $routes->delete('attachments/(:num)', '\Modules\Tasks\Controllers\TasksController::deleteFile/$1');
});
