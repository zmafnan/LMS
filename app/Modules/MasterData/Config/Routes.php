<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/master', ['filter' => 'jwt'], function($routes) {
    // Priorities
    $routes->get('priorities', '\Modules\MasterData\Controllers\MasterDataController::getPriorities');
    $routes->post('priorities', '\Modules\MasterData\Controllers\MasterDataController::storePriority');
    $routes->put('priorities/(:num)', '\Modules\MasterData\Controllers\MasterDataController::updatePriority/$1');
    $routes->delete('priorities/(:num)', '\Modules\MasterData\Controllers\MasterDataController::deletePriority/$1');

    // Kanban Categories
    $routes->get('categories', '\Modules\MasterData\Controllers\MasterDataController::getCategories');
    $routes->post('categories', '\Modules\MasterData\Controllers\MasterDataController::storeCategory');
    $routes->put('categories/(:num)', '\Modules\MasterData\Controllers\MasterDataController::updateCategory/$1');
    $routes->delete('categories/(:num)', '\Modules\MasterData\Controllers\MasterDataController::deleteCategory/$1');
});
