<?php

namespace Modules\Tasks\Models;

use CodeIgniter\Model;

class AttachmentModel extends Model
{
    protected $table = 'attachments';
    protected $primaryKey = 'id';
    protected $allowedFields = ['task_id', 'file_name', 'file_path', 'file_type', 'file_size', 'uploaded_by', 'created_at'];
    protected $useTimestamps = false;
}
