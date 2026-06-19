<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/kanban', ['filter' => 'jwt'], function($routes) {
    $routes->get('board', '\Modules\Kanban\Controllers\KanbanController::index');
    $routes->put('move', '\Modules\Kanban\Controllers\KanbanController::move');
});
