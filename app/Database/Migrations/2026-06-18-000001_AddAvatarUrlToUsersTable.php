<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddAvatarUrlToUsersTable extends Migration
{
    public function up()
    {
        if (!$this->db->fieldExists('avatar_url', 'users')) {
            $this->forge->addColumn('users', [
                'avatar_url' => [
                    'type'       => 'VARCHAR',
                    'constraint' => 255,
                    'null'       => true,
                    'after'      => 'role',
                ],
            ]);
        }
    }

    public function down()
    {
        if ($this->db->fieldExists('avatar_url', 'users')) {
            $this->forge->dropColumn('users', 'avatar_url');
        }
    }
}
