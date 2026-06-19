<?php

namespace Modules\Reports\Controllers;

use App\Controllers\BaseController;
use Modules\Reports\Services\ReportsService;

class ReportsController extends BaseController
{
    protected $service;

    public function __construct()
    {
        $this->service = new ReportsService();
    }

    /**
     * Responds with filtered reports arrays
     */
    public function index()
    {
        $filters = $this->request->getGet();
        $reportData = $this->service->generateReport($filters);
        return $this->response->setJSON($reportData);
    }
}
