<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class MainSeeder extends Seeder
{
    public function run()
    {
        $this->call('UserSeeder');
        $this->call('PrioritySeeder');
        $this->call('KanbanCategorySeeder');
        $this->call('TaskSeeder');
        $this->call('EmployeeSeeder');
    }
}
