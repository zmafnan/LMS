<?php

namespace Modules\MultiSkill\Repositories;

use Modules\MultiSkill\Models\LeanEmployeeModel;
use Config\Database;

class LeanEmployeeRepository
{
    protected $employeeModel;
    protected $db;

    public function __construct()
    {
        $this->employeeModel = new LeanEmployeeModel();
        $this->db = Database::connect();
    }

    /**
     * Get the SQL expression to count the number of filled skills (not null and not empty)
     */
    private function getSkillCountSql(): string
    {
        return "(
            (CASE WHEN skill_1 IS NOT NULL AND skill_1 != '' THEN 1 ELSE 0 END) +
            (CASE WHEN skill_2 IS NOT NULL AND skill_2 != '' THEN 1 ELSE 0 END) +
            (CASE WHEN skill_3 IS NOT NULL AND skill_3 != '' THEN 1 ELSE 0 END) +
            (CASE WHEN skill_4 IS NOT NULL AND skill_4 != '' THEN 1 ELSE 0 END) +
            (CASE WHEN skill_5 IS NOT NULL AND skill_5 != '' THEN 1 ELSE 0 END) +
            (CASE WHEN skill_6 IS NOT NULL AND skill_6 != '' THEN 1 ELSE 0 END) +
            (CASE WHEN skill_7 IS NOT NULL AND skill_7 != '' THEN 1 ELSE 0 END) +
            (CASE WHEN skill_8 IS NOT NULL AND skill_8 != '' THEN 1 ELSE 0 END) +
            (CASE WHEN skill_9 IS NOT NULL AND skill_9 != '' THEN 1 ELSE 0 END) +
            (CASE WHEN skill_10 IS NOT NULL AND skill_10 != '' THEN 1 ELSE 0 END)
        )";
    }

    /**
     * Get filtered employees list with pagination and search
     */
    public function getFilteredEmployees(array $filters = [], int $limit = 50, int $offset = 0)
    {
        $skillCountSql = $this->getSkillCountSql();
        $builder = $this->db->table('lean_employees')
            ->select("*, {$skillCountSql} as total_skill, (CASE WHEN {$skillCountSql} >= 3 THEN 'YES' ELSE 'NO' END) as is_multiskill");

        if (!empty($filters['search'])) {
            $builder->groupStart()
                ->like('nik', $filters['search'])
                ->orLike('employee_name', $filters['search'])
                ->orLike('position', $filters['search'])
                ->orLike('section', $filters['search'])
                ->orLike('line', $filters['search'])
                ->groupEnd();
        }

        if (!empty($filters['line'])) {
            $builder->where('line', $filters['line']);
        }

        if (!empty($filters['section'])) {
            $builder->where('section', $filters['section']);
        }

        if (!empty($filters['position'])) {
            $builder->where('position', $filters['position']);
        }

        if (!empty($filters['status'])) {
            $builder->where('status', $filters['status']);
        }

        // Sorting
        if (empty($filters['sort_by'])) {
            $builder->orderBy('line', 'ASC');
            $builder->orderBy("CASE WHEN section = 'Continuous Improvement' THEN 1 WHEN section = 'Industrial Engineering' THEN 2 WHEN section = 'Training & Culture' THEN 3 ELSE 4 END", 'ASC');
            $builder->orderBy('employee_name', 'ASC');
        } else {
            $sortBy = $filters['sort_by'];
            $sortOrder = $filters['sort_order'] ?? 'DESC';
            $allowedSort = ['nik', 'employee_name', 'position', 'section', 'line', 'join_date', 'status', 'created_at', 'total_skill'];
            if ($sortBy === 'total_skill') {
                $sortBy = $skillCountSql;
            } elseif (!in_array($sortBy, $allowedSort)) {
                $sortBy = 'created_at';
            }
            $sortOrder = strtoupper($sortOrder) === 'ASC' ? 'ASC' : 'DESC';
            $builder->orderBy($sortBy, $sortOrder);
        }

        // Clone builder for count
        $tempBuilder = clone $builder;
        $total = $tempBuilder->countAllResults(false);

        $results = $builder->limit($limit, $offset)->get()->getResultArray();

        return [
            'data' => $results,
            'total' => $total
        ];
    }

    public function find(int $id)
    {
        $skillCountSql = $this->getSkillCountSql();
        return $this->db->table('lean_employees')
            ->select("*, {$skillCountSql} as total_skill, (CASE WHEN {$skillCountSql} >= 3 THEN 'YES' ELSE 'NO' END) as is_multiskill")
            ->where('id', $id)
            ->get()
            ->getRowArray();
    }

    public function findByNik(string $nik)
    {
        $skillCountSql = $this->getSkillCountSql();
        return $this->db->table('lean_employees')
            ->select("*, {$skillCountSql} as total_skill, (CASE WHEN {$skillCountSql} >= 3 THEN 'YES' ELSE 'NO' END) as is_multiskill")
            ->where('nik', $nik)
            ->get()
            ->getRowArray();
    }

    public function create(array $data)
    {
        $this->employeeModel->insert($data);
        return $this->employeeModel->insertID();
    }

    public function update(int $id, array $data)
    {
        return $this->employeeModel->update($id, $data);
    }

    public function delete(int $id)
    {
        return $this->employeeModel->delete($id);
    }

    /**
     * Get aggregated multi skill metrics for analytics dashboard
     */
    public function getAnalyticsMetrics()
    {
        $skillCountSql = $this->getSkillCountSql();

        // 1. Total employees (all status) and active employees
        $totalActive = $this->db->table('lean_employees')->where('status', 'Active')->countAllResults();
        $totalAll = $this->db->table('lean_employees')->countAllResults();

        // 2. Total Multi Skill employees (Active, skills >= 3)
        $totalMultiskill = $this->db->table('lean_employees')
            ->where('status', 'Active')
            ->where("{$skillCountSql} >=", 3)
            ->countAllResults();

        // 3. Multi Skill Percentage
        $multiskillPct = $totalActive > 0 ? round(($totalMultiskill / $totalActive) * 100, 1) : 0;

        // 4. Employees by Section
        $bySection = $this->db->table('lean_employees')
            ->select('section, COUNT(*) as count')
            ->groupBy('section')
            ->orderBy('count', 'DESC')
            ->get()
            ->getResultArray();

        // 5. Employees by Line (focus area)
        $byLine = $this->db->table('lean_employees')
            ->select('line, COUNT(*) as count')
            ->groupBy('line')
            ->orderBy('count', 'DESC')
            ->get()
            ->getResultArray();

        // 6. Multi Skill by Line (counts total and multi-skilled operators)
        $lineQuery = "
            SELECT line,
                   COUNT(*) as total_count,
                   SUM(CASE WHEN {$skillCountSql} >= 3 THEN 1 ELSE 0 END) as multiskill_count
            FROM lean_employees
            WHERE status = 'Active' AND line IS NOT NULL AND line != ''
            GROUP BY line
            ORDER BY line ASC
        ";
        $lineData = $this->db->query($lineQuery)->getResultArray();

        $multiskillByLine = [];
        $highestPct = -1;
        $lowestPct = 101;
        $highestLine = '-';
        $lowestLine = '-';

        foreach ($lineData as $row) {
            $total = (int)$row['total_count'];
            $multi = (int)$row['multiskill_count'];
            $pct = $total > 0 ? round(($multi / $total) * 100, 1) : 0;

            $multiskillByLine[] = [
                'line' => $row['line'],
                'total_employees' => $total,
                'multiskill_employees' => $multi,
                'percentage' => $pct
            ];

            if ($pct > $highestPct) {
                $highestPct = $pct;
                $highestLine = $row['line'] . " (" . $pct . "%)";
            }
            if ($pct < $lowestPct) {
                $lowestPct = $pct;
                $lowestLine = $row['line'] . " (" . $pct . "%)";
            }
        }

        // 7. Multi Skill by Section
        $sectionQuery = "
            SELECT section,
                   COUNT(*) as total_count,
                   SUM(CASE WHEN {$skillCountSql} >= 3 THEN 1 ELSE 0 END) as multiskill_count
            FROM lean_employees
            WHERE status = 'Active' AND section IS NOT NULL AND section != ''
            GROUP BY section
        ";
        $sectionData = $this->db->query($sectionQuery)->getResultArray();

        $multiskillBySection = [];
        foreach ($sectionData as $row) {
            $total = (int)$row['total_count'];
            $multi = (int)$row['multiskill_count'];
            $pct = $total > 0 ? round(($multi / $total) * 100, 1) : 0;

            $multiskillBySection[] = [
                'section' => $row['section'],
                'total_employees' => $total,
                'multiskill_employees' => $multi,
                'percentage' => $pct
            ];
        }

        // 8. Skill Count Distribution (histogram 0 to 10 skills)
        $distributionQuery = "
            SELECT total_skill, COUNT(*) as count FROM (
                SELECT {$skillCountSql} as total_skill 
                FROM lean_employees
                WHERE status = 'Active'
            ) as temp
            GROUP BY total_skill
            ORDER BY total_skill ASC
        ";
        $rawDist = $this->db->query($distributionQuery)->getResultArray();
        
        $distribution = [];
        // Preset 0-10 categories
        for ($i = 0; $i <= 10; $i++) {
            $distribution[$i] = ['skills_count' => $i, 'employees_count' => 0];
        }
        foreach ($rawDist as $row) {
            $ts = (int)$row['total_skill'];
            if ($ts >= 0 && $ts <= 10) {
                $distribution[$ts]['employees_count'] = (int)$row['count'];
            }
        }
        $distribution = array_values($distribution);

        // 9. Top Multi Skill Employees
        $topEmployees = $this->db->table('lean_employees')
            ->select("nik, employee_name, line, section, {$skillCountSql} as total_skill")
            ->where('status', 'Active')
            ->orderBy('total_skill', 'DESC')
            ->orderBy('employee_name', 'ASC')
            ->limit(10)
            ->get()
            ->getResultArray();

        // 10. Most Common Skills count using UNION ALL on all skill columns
        $skillQuery = "
            SELECT skill, COUNT(*) as count FROM (
                SELECT skill_1 as skill FROM lean_employees WHERE skill_1 IS NOT NULL AND skill_1 != ''
                UNION ALL
                SELECT skill_2 as skill FROM lean_employees WHERE skill_2 IS NOT NULL AND skill_2 != ''
                UNION ALL
                SELECT skill_3 as skill FROM lean_employees WHERE skill_3 IS NOT NULL AND skill_3 != ''
                UNION ALL
                SELECT skill_4 as skill FROM lean_employees WHERE skill_4 IS NOT NULL AND skill_4 != ''
                UNION ALL
                SELECT skill_5 as skill FROM lean_employees WHERE skill_5 IS NOT NULL AND skill_5 != ''
                UNION ALL
                SELECT skill_6 as skill FROM lean_employees WHERE skill_6 IS NOT NULL AND skill_6 != ''
                UNION ALL
                SELECT skill_7 as skill FROM lean_employees WHERE skill_7 IS NOT NULL AND skill_7 != ''
                UNION ALL
                SELECT skill_8 as skill FROM lean_employees WHERE skill_8 IS NOT NULL AND skill_8 != ''
                UNION ALL
                SELECT skill_9 as skill FROM lean_employees WHERE skill_9 IS NOT NULL AND skill_9 != ''
                UNION ALL
                SELECT skill_10 as skill FROM lean_employees WHERE skill_10 IS NOT NULL AND skill_10 != ''
            ) AS all_skills
            GROUP BY skill
            ORDER BY count DESC
            LIMIT 10
        ";
        $topSkills = $this->db->query($skillQuery)->getResultArray();

        // 11. Recent Activities (last 5 updated employee skill records)
        $recentActivities = $this->db->table('lean_employees')
            ->select("nik, employee_name, line, section, position, {$skillCountSql} as total_skill, updated_at")
            ->orderBy('updated_at', 'DESC')
            ->limit(5)
            ->get()
            ->getResultArray();

        return [
            'total_all' => $totalAll,
            'total_active' => $totalActive,
            'total_multiskill' => $totalMultiskill,
            'multiskill_percentage' => $multiskillPct,
            'highest_multiskill_line' => $highestLine,
            'lowest_multiskill_line' => $lowestLine,
            'by_section' => $bySection,
            'by_line' => $byLine,
            'multiskill_by_line' => $multiskillByLine,
            'multiskill_by_section' => $multiskillBySection,
            'skill_distribution' => $distribution,
            'top_employees' => $topEmployees,
            'top_skills' => $topSkills,
            'recent_activities' => $recentActivities
        ];
    }
}
