<?php

namespace Config;

// Create a new instance of our RouteCollection class.
$routes = Services::routes();

// Load the system's routing file first, so that the app and ENVIRONMENT
// can override as needed.
if (is_file(SYSTEMPATH . 'Config/Routes.php')) {
    require SYSTEMPATH . 'Config/Routes.php';
}

/*
 * --------------------------------------------------------------------
 * Router Setup
 * --------------------------------------------------------------------
 */
$routes->setDefaultNamespace('App\Controllers');
$routes->setDefaultController('Home');
$routes->setDefaultMethod('index');
$routes->setTranslateURIDashes(false);
$routes->set404Override();

/*
 * --------------------------------------------------------------------
 * Route Definitions
 * --------------------------------------------------------------------
 */

// 1. Dynamic Modules Routes
$modulesPath = APPPATH . 'Modules';
if (is_dir($modulesPath)) {
    $modules = scandir($modulesPath);
    foreach ($modules as $module) {
        if ($module === '.' || $module === '..') {
            continue;
        }
        $routesPath = $modulesPath . '/' . $module . '/Config/Routes.php';
        if (file_exists($routesPath)) {
            require $routesPath;
        }
    }
}

// 2. Fallback to Frontend React Application
// Serve the index route
$routes->get('/', 'Home::index');

// Check the request URI
$uri = $_SERVER['REQUEST_URI'] ?? '';
$path = parse_url($uri, PHP_URL_PATH);
$cleanPath = ltrim($path, '/');

// If the path is not an API route, bind the fallback to Home::index
if (strpos($path, '/api/') === false && strpos($cleanPath, 'api/') !== 0) {
    $routes->get('(:any)', 'Home::index');
}

/*
 * --------------------------------------------------------------------
 * Additional Routing
 * --------------------------------------------------------------------
 */
if (is_file(APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php')) {
    require APPPATH . 'Config/' . ENVIRONMENT . '/Routes.php';
}
