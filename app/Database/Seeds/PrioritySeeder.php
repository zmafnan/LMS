<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class PrioritySeeder extends Seeder
{
    public function run()
    {
        $this->db->query("TRUNCATE TABLE priorities RESTART IDENTITY CASCADE");

        $data = [
            [
                'name'  => 'Critical',
                'color' => 'red',
                'level' => 1,
            ],
            [
                'name'  => 'High',
                'color' => 'orange',
                'level' => 2,
            ],
            [
                'name'  => 'Medium',
                'color' => 'blue',
                'level' => 3,
            ],
            [
                'name'  => 'Low',
                'color' => 'gray',
                'level' => 4,
            ]
        ];

        foreach ($data as $priority) {
            $this->db->table('priorities')->insert($priority);
        }
    }
}
