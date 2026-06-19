<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateDiscussionMessagesTable extends Migration
{
    /**
     * Set up discussions table.
     */
    public function up()
    {
        $this->db->query("CREATE TABLE discussion_messages (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }

    /**
     * Drop discussions table.
     */
    public function down()
    {
        $this->db->query("DROP TABLE IF EXISTS discussion_messages CASCADE");
    }
}
