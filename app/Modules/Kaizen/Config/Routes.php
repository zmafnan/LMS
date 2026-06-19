<?php

/** @var CodeIgniter\Router\RouteCollection $routes */

$routes->group('api/kaizen', ['filter' => 'jwt'], function($routes) {
    $routes->get('submissions', '\Modules\Kaizen\Controllers\KaizenController::getAllSubmissions');
    $routes->get('submissions/master-data', '\Modules\Kaizen\Controllers\KaizenController::getPassOkSubmissions');
    $routes->get('submissions/export/excel', '\Modules\Kaizen\Controllers\KaizenController::exportToExcel');
    $routes->get('submissions/ticket/(:any)', '\Modules\Kaizen\Controllers\KaizenController::getSubmissionByTicket/$1');
    $routes->get('submissions/(:any)', '\Modules\Kaizen\Controllers\KaizenController::getSubmissionById/$1');
    $routes->post('submissions', '\Modules\Kaizen\Controllers\KaizenController::createSubmission');
    $routes->put('submissions/(:any)', '\Modules\Kaizen\Controllers\KaizenController::updateSubmission/$1');
    $routes->delete('submissions/(:any)', '\Modules\Kaizen\Controllers\KaizenController::deleteSubmission/$1');
    
    // Actions
    $routes->patch('submissions/(:any)/validation', '\Modules\Kaizen\Controllers\KaizenController::updateValidationStatus/$1');
    $routes->patch('submissions/(:any)/impact', '\Modules\Kaizen\Controllers\KaizenController::updateImpactMetrics/$1');
    $routes->patch('submissions/(:any)/point', '\Modules\Kaizen\Controllers\KaizenController::updatePoint/$1');
    $routes->delete('submissions/(:any)/photo', '\Modules\Kaizen\Controllers\KaizenController::removePhoto/$1');
    
    // Rankings & Stats
    $routes->get('rankings', '\Modules\Kaizen\Controllers\KaizenController::getRankings');
    $routes->get('stats', '\Modules\Kaizen\Controllers\KaizenController::getStats');
});

// Public routes for print-friendly views (so target="_blank" can load them directly without JWT header)
$routes->get('api/kaizen/erc-pdf/(:any)', '\Modules\Kaizen\Controllers\KaizenController::ercPdf/$1');
$routes->get('api/kaizen/submission-report-pdf/(:any)', '\Modules\Kaizen\Controllers\KaizenController::kaizenPdf/$1');
