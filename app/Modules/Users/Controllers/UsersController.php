<?php

namespace Modules\Users\Controllers;

use App\Controllers\BaseController;
use Modules\Users\Services\UserService;
use App\Libraries\AuthService;

class UsersController extends BaseController
{
    protected $service;

    public function __construct()
    {
        $this->service = new UserService();
    }

    /**
     * Handle authentication and return token
     */
    public function login()
    {
        $json = $this->request->getJSON(true);
        $username = $json['username'] ?? '';
        $password = $json['password'] ?? '';

        if (empty($username) || empty($password)) {
            return $this->response->setJSON([
                'error' => 'Bad Request',
                'message' => 'Username and password are required.'
            ])->setStatusCode(400);
        }

        $authData = $this->service->authenticate($username, $password);
        if (!$authData) {
            return $this->response->setJSON([
                'error' => 'Unauthorized',
                'message' => 'Invalid username or password.'
            ])->setStatusCode(401);
        }

        return $this->response->setJSON($authData);
    }

    /**
     * Retrieve all users
     */
    public function index()
    {
        $users = $this->service->getUsersList();
        return $this->response->setJSON($users);
    }

    /**
     * Retrieve the active user's profile.
     */
    public function profile()
    {
        $userId = AuthService::id();
        if (!$userId) {
            return $this->response->setJSON([
                'error' => 'Unauthorized',
                'message' => 'User session is not available.'
            ])->setStatusCode(401);
        }

        $profile = $this->service->getUserProfile($userId);
        if (!$profile) {
            return $this->response->setJSON([
                'error' => 'Not Found',
                'message' => 'User profile was not found.'
            ])->setStatusCode(404);
        }

        return $this->response->setJSON($profile);
    }

    /**
     * Update the active user's profile and optional avatar photo.
     */
    public function updateProfile()
    {
        $userId = AuthService::id();
        if (!$userId) {
            return $this->response->setJSON([
                'error' => 'Unauthorized',
                'message' => 'User session is not available.'
            ])->setStatusCode(401);
        }

        $data = [
            'username' => $this->request->getPost('username'),
            'email'    => $this->request->getPost('email'),
        ];
        $data = array_filter($data, static fn ($value) => $value !== null && $value !== '');

        $avatar = $this->request->getFile('avatar');
        if ($avatar && $avatar->isValid() && !$avatar->hasMoved()) {
            if (strpos((string) $avatar->getMimeType(), 'image/') !== 0) {
                return $this->response->setJSON([
                    'error' => 'Bad Request',
                    'message' => 'Avatar must be an image file.'
                ])->setStatusCode(400);
            }

            if ($avatar->getSize() > 2 * 1024 * 1024) {
                return $this->response->setJSON([
                    'error' => 'Bad Request',
                    'message' => 'Avatar size must be 2MB or less.'
                ])->setStatusCode(400);
            }

            $uploadDir = FCPATH . 'uploads/avatars';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0775, true);
            }

            $newName = $avatar->getRandomName();
            $avatar->move($uploadDir, $newName);
            $data['avatar_url'] = '/uploads/avatars/' . $newName;
        }

        $profile = $this->service->updateProfile($userId, $data);
        if (!$profile) {
            return $this->response->setJSON([
                'error' => 'Internal Server Error',
                'message' => 'Failed to update profile.'
            ])->setStatusCode(500);
        }

        return $this->response->setJSON([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'user'    => $profile,
        ]);
    }

    /**
     * Store new user (Admin only)
     */
    public function store()
    {
        if (!AuthService::checkRole(['admin'])) {
            return $this->response->setJSON([
                'error' => 'Forbidden',
                'message' => 'Only administrators can create users.'
            ])->setStatusCode(403);
        }

        $json = $this->request->getJSON(true);
        
        if (empty($json['username']) || empty($json['email']) || empty($json['password']) || empty($json['role'])) {
            return $this->response->setJSON([
                'error' => 'Bad Request',
                'message' => 'All fields (username, email, password, role) are required.'
            ])->setStatusCode(400);
        }

        if ($this->service->createUser($json)) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'User created successfully.'
            ])->setStatusCode(201);
        }

        return $this->response->setJSON([
            'error' => 'Internal Server Error',
            'message' => 'Failed to create user.'
        ])->setStatusCode(500);
    }

    /**
     * Update user details (Admin only)
     */
    public function update($id = null)
    {
        if (!AuthService::checkRole(['admin'])) {
            return $this->response->setJSON([
                'error' => 'Forbidden',
                'message' => 'Only administrators can update users.'
            ])->setStatusCode(403);
        }

        $json = $this->request->getJSON(true);
        if ($this->service->updateUser((int)$id, $json)) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'User updated successfully.'
            ]);
        }

        return $this->response->setJSON([
            'error' => 'Internal Server Error',
            'message' => 'Failed to update user.'
        ])->setStatusCode(500);
    }

    /**
     * Delete a user (Admin only)
     */
    public function delete($id = null)
    {
        if (!AuthService::checkRole(['admin'])) {
            return $this->response->setJSON([
                'error' => 'Forbidden',
                'message' => 'Only administrators can delete users.'
            ])->setStatusCode(403);
        }

        if ($this->service->deleteUser((int)$id)) {
            return $this->response->setJSON([
                'success' => true,
                'message' => 'User deleted successfully.'
            ]);
        }

        return $this->response->setJSON([
            'error' => 'Internal Server Error',
            'message' => 'Failed to delete user.'
        ])->setStatusCode(500);
    }

    /**
     * Health check endpoint
     */
    public function health()
    {
        return $this->response->setJSON([
            'status' => 'OK', 
            'timestamp' => time(),
            'php_version' => PHP_VERSION
        ]);
    }
}
