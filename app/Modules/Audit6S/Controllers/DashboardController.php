<?php

namespace Modules\Audit6S\Controllers;

use App\Controllers\BaseController;

class DashboardController extends BaseController
{
    /**
     * Get department rankings based on selected time range
     */
    public function getAuditRankings()
    {
        try {
            $period = $this->request->getGet('period') ?: 'current_month';
            $year = $this->request->getGet('year');
            $month = $this->request->getGet('month');

            $db = \Config\Database::connect('audit6s');
            
            $whereClause = "1=1";
            $currentMonth = (int)date('m');
            $currentYear = (int)date('Y');

            if ($period === 'current_month') {
                $monthStr = str_pad($currentMonth, 2, '0', STR_PAD_LEFT);
                $startDate = "{$currentYear}-{$monthStr}-01 00:00:00";
                $endDate = date('Y-m-t 23:59:59', strtotime($startDate));
                $whereClause = "audit_date BETWEEN " . $db->escape($startDate) . " AND " . $db->escape($endDate);
            } elseif ($period === 'specific_month' && $month && $year) {
                $monthStr = str_pad($month, 2, '0', STR_PAD_LEFT);
                $startDate = "{$year}-{$monthStr}-01 00:00:00";
                $endDate = date('Y-m-t 23:59:59', strtotime($startDate));
                $whereClause = "audit_date BETWEEN " . $db->escape($startDate) . " AND " . $db->escape($endDate);
            } elseif ($period === 'yearly' && $year) {
                $startDate = "{$year}-01-01 00:00:00";
                $endDate = "{$year}-12-31 23:59:59";
                $whereClause = "audit_date BETWEEN " . $db->escape($startDate) . " AND " . $db->escape($endDate);
            }

            $selectFields = 'department_id,
                AVG(sort_score) as avg_sort,
                AVG(set_in_order_score) as avg_set_in_order,
                AVG(shine_score) as avg_shine,
                AVG(standardize_score) as avg_standardize,
                AVG(sustain_score) as avg_sustain,
                AVG(safety_score) as avg_safety,
                (AVG(sort_score) + AVG(set_in_order_score) + AVG(shine_score) + AVG(standardize_score) + AVG(sustain_score) + AVG(safety_score)) / 6 as final_score';

            // Query Production
            $prodRankings = $db->table('ProductionAudits a')
                ->select("a.department_id, d.name as department_name, $selectFields")
                ->join('Departments d', 'd.id = a.department_id')
                ->where('d.type', 'production')
                ->where($whereClause)
                ->groupBy('a.department_id, d.id, d.name')
                ->orderBy('final_score', 'DESC')
                ->get()
                ->getResultArray();

            // Query Non-Production
            $nonProdRankings = $db->table('NonProductionAudits a')
                ->select("a.department_id, d.name as department_name, $selectFields")
                ->join('Departments d', 'd.id = a.department_id')
                ->where('d.type', 'non-production')
                ->where($whereClause)
                ->groupBy('a.department_id, d.id, d.name')
                ->orderBy('final_score', 'DESC')
                ->get()
                ->getResultArray();

            $formattedProd = [];
            foreach ($prodRankings as $index => $rank) {
                $formattedProd[] = [
                    'rank' => $index + 1,
                    'department_name' => $rank['department_name'],
                    'scores' => [
                        'sort' => number_format((float)$rank['avg_sort'], 2),
                        'set_in_order' => number_format((float)$rank['avg_set_in_order'], 2),
                        'shine' => number_format((float)$rank['avg_shine'], 2),
                        'standardize' => number_format((float)$rank['avg_standardize'], 2),
                        'sustain' => number_format((float)$rank['avg_sustain'], 2),
                        'safety' => number_format((float)$rank['avg_safety'], 2),
                    ],
                    'final_score' => number_format((float)$rank['final_score'], 2)
                ];
            }

            $formattedNonProd = [];
            foreach ($nonProdRankings as $index => $rank) {
                $formattedNonProd[] = [
                    'rank' => $index + 1,
                    'department_name' => $rank['department_name'],
                    'scores' => [
                        'sort' => number_format((float)$rank['avg_sort'], 2),
                        'set_in_order' => number_format((float)$rank['avg_set_in_order'], 2),
                        'shine' => number_format((float)$rank['avg_shine'], 2),
                        'standardize' => number_format((float)$rank['avg_standardize'], 2),
                        'sustain' => number_format((float)$rank['avg_sustain'], 2),
                        'safety' => number_format((float)$rank['avg_safety'], 2),
                    ],
                    'final_score' => number_format((float)$rank['final_score'], 2)
                ];
            }

            return $this->response->setJSON([
                'productionRankings' => $formattedProd,
                'nonProductionRankings' => $formattedNonProd
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => 'Failed to fetch audit rankings',
                'error' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    /**
     * Get monthly average score trends for a year
     */
    public function getYearlyTrends()
    {
        try {
            $year = $this->request->getGet('year') ?: date('Y');
            $type = $this->request->getGet('departmentType') ?: 'production';
            $table = $type === 'production' ? 'ProductionAudits' : 'NonProductionAudits';

            $db = \Config\Database::connect('audit6s');

            $startDate = "{$year}-01-01 00:00:00";
            $endDate = "{$year}-12-31 23:59:59";

            $monthlyData = $db->table($table . ' a')
                ->select('EXTRACT(MONTH FROM CAST(a.audit_date AS DATE)) as month, 
                          (AVG(a.sort_score) + AVG(a.set_in_order_score) + AVG(a.shine_score) + AVG(a.standardize_score) + AVG(a.sustain_score) + AVG(a.safety_score)) / 6 as average_score,
                          COUNT(DISTINCT a.department_id) as department_count')
                ->join('Departments d', 'd.id = a.department_id')
                ->where('d.type', $type)
                ->where('a.audit_date >=', $startDate)
                ->where('a.audit_date <=', $endDate)
                ->groupBy('EXTRACT(MONTH FROM CAST(a.audit_date AS DATE))')
                ->orderBy('month', 'ASC')
                ->get()
                ->getResultArray();

            $formattedData = [];
            for ($monthIndex = 0; $monthIndex < 12; $monthIndex++) {
                $monthNumber = $monthIndex + 1;
                $found = null;
                foreach ($monthlyData as $row) {
                    if ((int)$row['month'] === $monthNumber) {
                        $found = $row;
                        break;
                    }
                }

                $formattedData[] = [
                    'month' => $monthIndex,
                    'score' => $found ? number_format((float)$found['average_score'], 2) : null,
                    'department_count' => $found ? (int)$found['department_count'] : 0,
                ];
            }

            return $this->response->setJSON([
                'year' => (int)$year,
                'department_type' => $type,
                'data' => $formattedData
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => 'Failed to fetch yearly trends',
                'error' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    /**
     * Get monthly rankings for advanced dashboard
     */
    public function getMonthlyRankings()
    {
        try {
            $month = $this->request->getGet('month') ?: date('m');
            $year = $this->request->getGet('year') ?: date('Y');
            $type = $this->request->getGet('departmentType') ?: 'production';
            $table = $type === 'production' ? 'ProductionAudits' : 'NonProductionAudits';

            $db = \Config\Database::connect('audit6s');

            $rankings = $db->table($table . ' a')
                ->select('a.department_id, d.name as department_name,
                          AVG(a.sort_score) as avg_sort,
                          AVG(a.set_in_order_score) as avg_set_in_order,
                          AVG(a.shine_score) as avg_shine,
                          AVG(a.standardize_score) as avg_standardize,
                          AVG(a.sustain_score) as avg_sustain,
                          AVG(a.safety_score) as avg_safety,
                          (AVG(a.sort_score) + AVG(a.set_in_order_score) + AVG(a.shine_score) + AVG(a.standardize_score) + AVG(a.sustain_score) + AVG(a.safety_score)) / 6 as final_score')
                ->join('Departments d', 'd.id = a.department_id')
                ->where('d.type', $type)
                ->where('a.audit_date >=', "{$year}-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-01 00:00:00")
                ->where('a.audit_date <=', date('Y-m-t 23:59:59', strtotime("{$year}-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-01")))
                ->groupBy('a.department_id, d.id, d.name')
                ->orderBy('final_score', 'DESC')
                ->get()
                ->getResultArray();

            $formatted = [];
            foreach ($rankings as $index => $rank) {
                $formatted[] = [
                    'rank' => $index + 1,
                    'department_id' => (int)$rank['department_id'],
                    'department_name' => $rank['department_name'],
                    'final_score' => number_format((float)$rank['final_score'], 2),
                    'scores' => [
                        'sort' => number_format((float)$rank['avg_sort'], 2),
                        'set_in_order' => number_format((float)$rank['avg_set_in_order'], 2),
                        'shine' => number_format((float)$rank['avg_shine'], 2),
                        'standardize' => number_format((float)$rank['avg_standardize'], 2),
                        'sustain' => number_format((float)$rank['avg_sustain'], 2),
                        'safety' => number_format((float)$rank['avg_safety'], 2),
                    ]
                ];
            }

            return $this->response->setJSON([
                'month' => (int)$month,
                'year' => (int)$year,
                'department_type' => $type,
                'rankings' => $formatted
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'message' => 'Failed to fetch monthly rankings',
                'error' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }

    /**
     * Get department score trends over time
     */
    public function getDepartmentScoreTrends()
    {
        try {
            $department_id_str = $this->request->getGet('department_id');
            $period = $this->request->getGet('period') ?: 'last_6_months';
            $startDate = $this->request->getGet('start_date');
            $endDate = $this->request->getGet('end_date');

            if (!$department_id_str) {
                return $this->response->setJSON(['message' => 'At least one department_id is required'])->setStatusCode(400);
            }

            $department_ids = array_map('intval', explode(',', $department_id_str));

            $db = \Config\Database::connect('audit6s');

            // Find departments info
            $departments = $db->table('Departments')
                ->whereIn('id', $department_ids)
                ->get()
                ->getResultArray();

            if (empty($departments)) {
                return $this->response->setJSON(['message' => 'No departments found'])->setStatusCode(404);
            }

            $deptTypes = [];
            foreach ($departments as $d) {
                $deptTypes[(int)$d['id']] = [
                    'name' => $d['name'],
                    'type' => $d['type']
                ];
            }

            // Time range filter
            $timeFilterStr = "1=1";
            if ($startDate && $endDate) {
                $timeFilterStr = "audit_date BETWEEN " . $db->escape($startDate) . " AND " . $db->escape($endDate);
            } else {
                if ($period === 'last_6_months') {
                    $sixMonthsAgo = date('Y-m-d', strtotime('-6 months'));
                    $timeFilterStr = "audit_date >= " . $db->escape($sixMonthsAgo);
                } elseif ($period === 'last_12_months') {
                    $twelveMonthsAgo = date('Y-m-d', strtotime('-12 months'));
                    $timeFilterStr = "audit_date >= " . $db->escape($twelveMonthsAgo);
                } elseif ($period === 'current_year') {
                    $startOfYear = date('Y-01-01');
                    $timeFilterStr = "audit_date >= " . $db->escape($startOfYear);
                }
            }

            $results = [];

            // Group requested IDs by type
            $prodIds = [];
            $nonProdIds = [];
            foreach ($deptTypes as $id => $info) {
                if ($info['type'] === 'production') {
                    $prodIds[] = $id;
                } else {
                    $nonProdIds[] = $id;
                }
            }

            // Fetch production audits
            if (!empty($prodIds)) {
                $prodAudits = $db->table('ProductionAudits a')
                    ->select('a.*')
                    ->whereIn('a.department_id', $prodIds)
                    ->where($timeFilterStr)
                    ->orderBy('a.audit_date', 'ASC')
                    ->get()
                    ->getResultArray();

                foreach ($prodIds as $id) {
                    $results[$id] = [
                        'department_id' => $id,
                        'department_name' => $deptTypes[$id]['name'],
                        'type' => 'production',
                        'data_points' => []
                    ];
                }

                foreach ($prodAudits as $audit) {
                    $avg = ($audit['sort_score'] + $audit['set_in_order_score'] + $audit['shine_score'] + $audit['standardize_score'] + $audit['sustain_score'] + $audit['safety_score']) / 6;
                    $deptId = (int)$audit['department_id'];
                    $results[$deptId]['data_points'][] = [
                        'date' => $audit['audit_date'],
                        'grand_total_score' => (float)number_format($avg, 2),
                        'audit_id' => (int)$audit['id'],
                        'schedule_id' => $audit['schedule_id'] ? (int)$audit['schedule_id'] : null
                    ];
                }
            }

            // Fetch non-production audits
            if (!empty($nonProdIds)) {
                $nonProdAudits = $db->table('NonProductionAudits a')
                    ->select('a.*')
                    ->whereIn('a.department_id', $nonProdIds)
                    ->where($timeFilterStr)
                    ->orderBy('a.audit_date', 'ASC')
                    ->get()
                    ->getResultArray();

                foreach ($nonProdIds as $id) {
                    $results[$id] = [
                        'department_id' => $id,
                        'department_name' => $deptTypes[$id]['name'],
                        'type' => 'non-production',
                        'data_points' => []
                    ];
                }

                foreach ($nonProdAudits as $audit) {
                    $avg = ($audit['sort_score'] + $audit['set_in_order_score'] + $audit['shine_score'] + $audit['standardize_score'] + $audit['sustain_score'] + $audit['safety_score']) / 6;
                    $deptId = (int)$audit['department_id'];
                    $results[$deptId]['data_points'][] = [
                        'date' => $audit['audit_date'],
                        'grand_total_score' => (float)number_format($avg, 2),
                        'audit_id' => (int)$audit['id'],
                        'schedule_id' => $audit['schedule_id'] ? (int)$audit['schedule_id'] : null
                    ];
                }
            }

            return $this->response->setJSON([
                'success' => true,
                'data' => array_values($results)
            ]);
        } catch (\Exception $e) {
            return $this->response->setJSON([
                'success' => false,
                'message' => 'Failed to fetch department score trends',
                'error' => $e->getMessage()
            ])->setStatusCode(500);
        }
    }
}
