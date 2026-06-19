<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/multiskill', ['filter' => 'jwt'], function($routes) {
    $routes->get('employees', '\Modules\MultiSkill\Controllers\MultiSkillController::getEmployees');
    $routes->post('employees', '\Modules\MultiSkill\Controllers\MultiSkillController::createEmployee');
    $routes->put('employees/(:num)', '\Modules\MultiSkill\Controllers\MultiSkillController::updateEmployee/$1');
    $routes->delete('employees/(:num)', '\Modules\MultiSkill\Controllers\MultiSkillController::deleteEmployee/$1');
    $routes->post('employees/bulk', '\Modules\MultiSkill\Controllers\MultiSkillController::bulkImportEmployees');
    $routes->get('analytics', '\Modules\MultiSkill\Controllers\MultiSkillController::getAnalytics');
    $routes->get('reports', '\Modules\MultiSkill\Controllers\MultiSkillController::getReports');

    // Lean Team sub-routes
    $routes->get('lean/employees', '\Modules\MultiSkill\Controllers\LeanMultiSkillController::getEmployees');
    $routes->post('lean/employees', '\Modules\MultiSkill\Controllers\LeanMultiSkillController::createEmployee');
    $routes->put('lean/employees/(:num)', '\Modules\MultiSkill\Controllers\LeanMultiSkillController::updateEmployee/$1');
    $routes->delete('lean/employees/(:num)', '\Modules\MultiSkill\Controllers\LeanMultiSkillController::deleteEmployee/$1');
    $routes->post('lean/employees/bulk', '\Modules\MultiSkill\Controllers\LeanMultiSkillController::bulkImportEmployees');
    $routes->get('lean/analytics', '\Modules\MultiSkill\Controllers\LeanMultiSkillController::getAnalytics');
    $routes->get('lean/reports', '\Modules\MultiSkill\Controllers\LeanMultiSkillController::getReports');
});
