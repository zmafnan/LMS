<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateLeanEmployeesTable extends Migration
{
    /**
     * Set up the lean_employees table in PostgreSQL, matching the employees structure.
     */
    public function up()
    {
        $this->db->query("CREATE TABLE lean_employees (
            id SERIAL PRIMARY KEY,
            nik VARCHAR(50) NOT NULL UNIQUE,
            employee_name VARCHAR(255) NOT NULL,
            position VARCHAR(100),
            section VARCHAR(100),
            line VARCHAR(100),
            skill_1 VARCHAR(255),
            skill_1_grade VARCHAR(10),
            skill_2 VARCHAR(255),
            skill_2_grade VARCHAR(10),
            skill_3 VARCHAR(255),
            skill_3_grade VARCHAR(10),
            skill_4 VARCHAR(255),
            skill_4_grade VARCHAR(10),
            skill_5 VARCHAR(255),
            skill_5_grade VARCHAR(10),
            skill_6 VARCHAR(255),
            skill_6_grade VARCHAR(10),
            skill_7 VARCHAR(255),
            skill_7_grade VARCHAR(10),
            skill_8 VARCHAR(255),
            skill_8_grade VARCHAR(10),
            skill_9 VARCHAR(255),
            skill_9_grade VARCHAR(10),
            skill_10 VARCHAR(255),
            skill_10_grade VARCHAR(10),
            join_date DATE,
            status VARCHAR(50) DEFAULT 'Active' NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");

        // Add index on NIK and name for faster lookup
        $this->db->query("CREATE INDEX idx_lean_employees_nik ON lean_employees(nik)");
        $this->db->query("CREATE INDEX idx_lean_employees_name ON lean_employees(employee_name)");
    }

    /**
     * Rollback the table creation.
     */
    public function down()
    {
        $this->db->query("DROP TABLE IF EXISTS lean_employees CASCADE");
    }
}
