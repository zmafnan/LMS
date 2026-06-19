<?php

namespace Modules\Discussions\Controllers;

use App\Controllers\BaseController;
use Modules\Discussions\Services\DiscussionService;
use App\Libraries\AuthService;

class DiscussionsController extends BaseController
{
    protected $service;

    public function __construct()
    {
        $this->service = new DiscussionService();
    }

    /**
     * Get discussion messages list
     */
    public function index()
    {
        $messages = $this->service->getMessagesList();
        return $this->response->setJSON($messages);
    }

    /**
     * Post new message in discussion group
     */
    public function store()
    {
        $json = $this->request->getJSON(true);
        $message = $json['message'] ?? '';
        
        if (empty(trim($message))) {
            return $this->response->setJSON([
                'error' => 'Bad Request',
                'message' => 'Message content cannot be empty.'
            ])->setStatusCode(400);
        }

        $userId = AuthService::id();
        if (!$userId) {
            return $this->response->setJSON([
                'error' => 'Unauthorized',
                'message' => 'User context is missing.'
            ])->setStatusCode(401);
        }

        if ($this->service->postNewMessage($userId, $message)) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'Message posted successfully.'
            ])->setStatusCode(201);
        }

        return $this->response->setJSON([
            'error' => 'Internal Server Error',
            'message' => 'Failed to post message.'
        ])->setStatusCode(500);
    }
}
