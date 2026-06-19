<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class TaskSeeder extends Seeder
{
    public function run()
    {
        $this->db->query("TRUNCATE TABLE tasks RESTART IDENTITY CASCADE");

        // Fetch IDs to ensure validity
        $db = \Config\Database::connect();
        
        $users = $db->table('users')->get()->getResultArray();
        $priorities = $db->table('priorities')->get()->getResultArray();
        $categories = $db->table('kanban_categories')->get()->getResultArray();
        
        $userIdMap = [];
        foreach ($users as $u) {
            $userIdMap[$u['username']] = $u['id'];
        }
        
        $priorityIdMap = [];
        foreach ($priorities as $p) {
            $priorityIdMap[$p['name']] = $p['id'];
        }
        
        $categoryIdMap = [];
        foreach ($categories as $c) {
            $categoryIdMap[$c['name']] = $c['id'];
        }
        
        $adminId = $userIdMap['admin'] ?? 1;
        $leaderId = $userIdMap['leader'] ?? 2;
        $picId = $userIdMap['pic'] ?? 3;
        
        $tasks = [
            [
                'task_name'            => 'Implement 5S in Assembly Line A',
                'description'          => 'Sort, set in order, shine, standardize, and sustain assembly line workstations to minimize waste and clutter.',
                'priority_id'          => $priorityIdMap['High'] ?? null,
                'kanban_category_id'   => $categoryIdMap['5S'] ?? null,
                'status'               => 'In Progress',
                'assigned_to'          => $picId,
                'start_date'           => '2026-05-01',
                'due_date'             => '2026-05-30',
                'progress'             => 60,
                'notes'                => 'Line A currently experiences search waste for tools.',
                'root_cause'           => 'No designated locations or shadowing for key tooling.',
                'improvement_category' => '5S & Workspace Organization',
                'benefit'              => 'Reduces tool search time by 80% and increases safety.',
                'saving_cost'          => 1200.00,
                'created_by'           => $adminId,
            ],
            [
                'task_name'            => 'Reduce SMED Changeover on Press 04',
                'description'          => 'Analyze current setup process and convert internal elements to external elements to reduce press setup time.',
                'priority_id'          => $priorityIdMap['Critical'] ?? null,
                'kanban_category_id'   => $categoryIdMap['SMED'] ?? null,
                'status'               => 'To Do',
                'assigned_to'          => $leaderId,
                'start_date'           => '2026-05-10',
                'due_date'             => '2026-06-15',
                'progress'             => 15,
                'notes'                => 'Target changeover reduction is from 45 mins to under 15 mins.',
                'root_cause'           => 'Waiting for crane and die warming while press is stopped.',
                'improvement_category' => 'SMED Setup Reduction',
                'benefit'              => 'Increases press utilization and supports smaller batch sizes.',
                'saving_cost'          => 4500.00,
                'created_by'           => $adminId,
            ],
            [
                'task_name'            => 'Map Value Stream for Product Family X',
                'description'          => 'Create current state Value Stream Map (VSM) to identify bottlenecks, waste, and cycle time variations.',
                'priority_id'          => $priorityIdMap['Medium'] ?? null,
                'kanban_category_id'   => $categoryIdMap['Lean Assessment'] ?? null,
                'status'               => 'Review',
                'assigned_to'          => $picId,
                'start_date'           => '2026-04-20',
                'due_date'             => '2026-05-25',
                'progress'             => 90,
                'notes'                => 'VSM completed and reviewed by leadership team. Finalizing future state design.',
                'root_cause'           => 'High lead times and excess inventory between packaging and shipping.',
                'improvement_category' => 'Value Stream Mapping',
                'benefit'              => 'Identified 4 hours of non-value-added waiting time.',
                'saving_cost'          => 2300.00,
                'created_by'           => $leaderId,
            ],
            [
                'task_name'            => 'Kanban Card Trigger replenishment setup',
                'description'          => 'Set up visual kanban post and card bins for automated hardware component replenishment.',
                'priority_id'          => $priorityIdMap['Low'] ?? null,
                'kanban_category_id'   => $categoryIdMap['Kaizen'] ?? null,
                'status'               => 'Done',
                'assigned_to'          => $picId,
                'start_date'           => '2026-04-01',
                'due_date'             => '2026-04-25',
                'progress'             => 100,
                'notes'                => 'Successfully operationalized. Bin triggers work perfectly.',
                'root_cause'           => 'Frequent material stockouts causing assembly stop.',
                'improvement_category' => 'Visual Management',
                'benefit'              => 'Zero stockouts of fasteners recorded since implementation.',
                'saving_cost'          => 850.00,
                'created_by'           => $leaderId,
            ],
            [
                'task_name'            => 'Standard Work Sheets (SWS) Audit',
                'description'          => 'Conduct operator audits to ensure cycle times match SWS guidelines.',
                'priority_id'          => $priorityIdMap['High'] ?? null,
                'kanban_category_id'   => $categoryIdMap['Line Balancing'] ?? null,
                'status'               => 'Backlog',
                'assigned_to'          => $picId,
                'start_date'           => '2026-06-01',
                'due_date'             => '2026-06-20',
                'progress'             => 0,
                'notes'                => 'Scheduled for next month audit cycle.',
                'root_cause'           => 'Process drifts causing variability in assembly output.',
                'improvement_category' => 'Standardized Work',
                'benefit'              => 'Maintains consistent takt-time adherence.',
                'saving_cost'          => 1500.00,
                'created_by'           => $adminId,
            ]
        ];

        foreach ($tasks as $task) {
            $this->db->table('tasks')->insert($task);
            
            // Add a log for task creation
            $insertedId = $this->db->insertID();
            $this->db->table('task_logs')->insert([
                'task_id'    => $insertedId,
                'user_id'    => $task['created_by'],
                'activity'   => 'created task',
                'details'    => json_encode(['task_name' => $task['task_name']]),
                'created_at' => date('Y-m-d H:i:s')
            ]);
        }
    }
}
