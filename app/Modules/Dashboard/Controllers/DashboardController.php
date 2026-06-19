<?php

namespace Modules\Dashboard\Controllers;

use App\Controllers\BaseController;
use Modules\Dashboard\Services\DashboardService;

class DashboardController extends BaseController
{
    protected $service;

    public function __construct()
    {
        $this->service = new DashboardService();
    }

    /**
     * Retrieve aggregated statistics for KPIs and graphs
     */
    public function index()
    {
        $data = $this->service->getDashboardMetrics();
        return $this->response->setJSON($data);
    }
}
