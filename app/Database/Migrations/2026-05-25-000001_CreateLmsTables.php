<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLmsTables extends Migration
{
    /**
     * Set up tables in PostgreSQL with correct constraints and data types.
     */
    public function up()
    {
        // 1. Users Table
        $this->db->query("CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) NOT NULL UNIQUE,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL, -- admin, leader, pic
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 2. Priorities Table
        $this->db->query("CREATE TABLE priorities (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(50) NOT NULL, -- hex or mantine core color string
            level INT NOT NULL UNIQUE, -- 1 = Critical, 2 = High, etc.
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 3. Kanban Categories Table
        $this->db->query("CREATE TABLE kanban_categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            color VARCHAR(50) NOT NULL, -- hex or mantine core color string
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 4. Tasks Table
        $this->db->query("CREATE TABLE tasks (
            id SERIAL PRIMARY KEY,
            task_name VARCHAR(255) NOT NULL,
            description TEXT,
            priority_id INT REFERENCES priorities(id) ON DELETE SET NULL,
            kanban_category_id INT REFERENCES kanban_categories(id) ON DELETE SET NULL,
            status VARCHAR(50) DEFAULT 'Backlog' NOT NULL,
            assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
            start_date DATE,
            due_date DATE,
            progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
            notes TEXT,
            root_cause TEXT,
            improvement_category VARCHAR(100),
            benefit TEXT,
            saving_cost NUMERIC(15, 2) DEFAULT 0.00,
            created_by INT REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 5. Attachments Table
        $this->db->query("CREATE TABLE attachments (
            id SERIAL PRIMARY KEY,
            task_id INT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
            file_name VARCHAR(255) NOT NULL,
            file_path VARCHAR(255) NOT NULL,
            file_type VARCHAR(100),
            file_size INT,
            uploaded_by INT REFERENCES users(id) ON DELETE SET NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // 6. Task Logs Table
        $this->db->query("CREATE TABLE task_logs (
            id SERIAL PRIMARY KEY,
            task_id INT REFERENCES tasks(id) ON DELETE CASCADE,
            user_id INT REFERENCES users(id) ON DELETE SET NULL,
            activity VARCHAR(255) NOT NULL,
            details TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
    }

    /**
     * Clean up tables.
     */
    public function down()
    {
        $this->db->query("DROP TABLE IF EXISTS task_logs CASCADE");
        $this->db->query("DROP TABLE IF EXISTS attachments CASCADE");
        $this->db->query("DROP TABLE IF EXISTS tasks CASCADE");
        $this->db->query("DROP TABLE IF EXISTS kanban_categories CASCADE");
        $this->db->query("DROP TABLE IF EXISTS priorities CASCADE");
        $this->db->query("DROP TABLE IF EXISTS users CASCADE");
    }
}
