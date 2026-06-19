<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run()
    {
        // Truncate first to avoid duplicates
        $this->db->query("TRUNCATE TABLE users RESTART IDENTITY CASCADE");

        $data = [
            [
                'username' => 'admin',
                'email'    => 'admin@lms.local',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'role'     => 'admin',
            ],
            [
                'username' => 'leader',
                'email'    => 'leader@lms.local',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'role'     => 'leader',
            ],
            [
                'username' => 'pic',
                'email'    => 'pic@lms.local',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'role'     => 'pic',
            ],
            [
                'username' => 'prodadmin',
                'email'    => 'prodadmin@lms.local',
                'password' => password_hash('password123', PASSWORD_BCRYPT),
                'role'     => 'production_admin',
            ]
        ];

        foreach ($data as $user) {
            $this->db->table('users')->insert($user);
        }
    }
}
