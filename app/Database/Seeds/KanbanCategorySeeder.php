<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class KanbanCategorySeeder extends Seeder
{
    public function run()
    {
        $this->db->query("TRUNCATE TABLE kanban_categories RESTART IDENTITY CASCADE");

        $data = [
            [
                'name'       => 'Lean Assessment',
                'color'      => 'blue',
            ],
            [
                'name'       => 'Line Balancing',
                'color'      => 'violet',
            ],
            [
                'name'       => 'SMED',
                'color'      => 'orange',
            ],
            [
                'name'       => 'Kaizen',
                'color'      => 'green',
            ],
            [
                'name'       => '5S',
                'color'      => 'yellow',
            ],
            [
                'name'       => 'Six Sigma',
                'color'      => 'red',
            ]
        ];

        foreach ($data as $cat) {
            $this->db->table('kanban_categories')->insert($cat);
        }
    }
}
