<?php

namespace Modules\Discussions\Models;

use CodeIgniter\Model;

class DiscussionMessageModel extends Model
{
    protected $table = 'discussion_messages';
    protected $primaryKey = 'id';
    protected $allowedFields = ['user_id', 'message', 'created_at'];
    protected $useTimestamps = false;
}
