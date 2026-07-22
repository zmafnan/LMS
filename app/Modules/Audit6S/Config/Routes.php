<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/audit6s', ['filter' => 'jwt'], function($routes) {
    // Dashboard routes
    $routes->get('dashboard/rankings', '\Modules\Audit6S\Controllers\DashboardController::getAuditRankings');
    $routes->get('advanced-dashboard/yearly-trends', '\Modules\Audit6S\Controllers\DashboardController::getYearlyTrends');
    $routes->get('advanced-dashboard/monthly-rankings', '\Modules\Audit6S\Controllers\DashboardController::getMonthlyRankings');
    $routes->get('trends/department-scores', '\Modules\Audit6S\Controllers\DashboardController::getDepartmentScoreTrends');

    // Department routes
    $routes->get('departments', '\Modules\Audit6S\Controllers\DepartmentController::getAllDepartments');
    $routes->get('departments/(:num)', '\Modules\Audit6S\Controllers\DepartmentController::getDepartmentById/$1');
    $routes->post('departments', '\Modules\Audit6S\Controllers\DepartmentController::createDepartment');
    $routes->put('departments/(:num)', '\Modules\Audit6S\Controllers\DepartmentController::updateDepartment/$1');
    $routes->delete('departments/(:num)', '\Modules\Audit6S\Controllers\DepartmentController::deleteDepartment/$1');

    // Schedule routes
    $routes->get('schedules', '\Modules\Audit6S\Controllers\ScheduleController::getAllSchedules');
    $routes->get('schedules/(:num)', '\Modules\Audit6S\Controllers\ScheduleController::getScheduleById/$1');
    $routes->post('schedules', '\Modules\Audit6S\Controllers\ScheduleController::createSchedule');
    $routes->put('schedules/(:num)', '\Modules\Audit6S\Controllers\ScheduleController::updateSchedule/$1');
    $routes->delete('schedules/(:num)', '\Modules\Audit6S\Controllers\ScheduleController::deleteSchedule/$1');
    $routes->post('schedules/monthly', '\Modules\Audit6S\Controllers\ScheduleController::createMonthlySchedules');
    $routes->get('schedules/export/excel', '\Modules\Audit6S\Controllers\ScheduleController::exportToExcel');

    // Production Audit routes
    $routes->get('production-audits/previous', '\Modules\Audit6S\Controllers\ProductionAuditController::getPreviousAudit');
    $routes->get('production-audits', '\Modules\Audit6S\Controllers\ProductionAuditController::getAllAudits');
    $routes->get('production-audits/(:num)', '\Modules\Audit6S\Controllers\ProductionAuditController::getAuditById/$1');
    $routes->post('production-audits', '\Modules\Audit6S\Controllers\ProductionAuditController::createAudit');
    $routes->match(['put', 'post'], 'production-audits/(:num)', '\Modules\Audit6S\Controllers\ProductionAuditController::updateAudit/$1');
    $routes->delete('production-audits/(:num)', '\Modules\Audit6S\Controllers\ProductionAuditController::deleteAudit/$1');
    
    // Non-Production Audit routes
    $routes->get('non-production-audits/previous', '\Modules\Audit6S\Controllers\NonProductionAuditController::getPreviousAudit');
    $routes->get('non-production-audits', '\Modules\Audit6S\Controllers\NonProductionAuditController::getAllAudits');
    $routes->get('non-production-audits/(:num)', '\Modules\Audit6S\Controllers\NonProductionAuditController::getAuditById/$1');
    $routes->post('non-production-audits', '\Modules\Audit6S\Controllers\NonProductionAuditController::createAudit');
    $routes->match(['put', 'post'], 'non-production-audits/(:num)', '\Modules\Audit6S\Controllers\NonProductionAuditController::updateAudit/$1');
    $routes->delete('non-production-audits/(:num)', '\Modules\Audit6S\Controllers\NonProductionAuditController::deleteAudit/$1');
});
