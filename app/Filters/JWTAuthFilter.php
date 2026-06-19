<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use App\Libraries\JWT;
use App\Libraries\AuthService;
use Config\Services;

class JWTAuthFilter implements FilterInterface
{
    /**
     * Inspect incoming request for JWT Bearer token and validate it.
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        $authHeader = $request->getHeaderLine('Authorization');
        
        if (empty($authHeader)) {
            if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
            } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
                $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
            } elseif (function_exists('apache_request_headers')) {
                $headers = apache_request_headers();
                if (isset($headers['Authorization'])) {
                    $authHeader = $headers['Authorization'];
                } elseif (isset($headers['authorization'])) {
                    $authHeader = $headers['authorization'];
                }
            }
        }
        
        if (empty($authHeader)) {
            return Services::response()
                ->setJSON([
                    'error' => 'Unauthorized',
                    'message' => 'Access token is required.'
                ])
                ->setStatusCode(401);
        }
        
        $token = null;
        if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            $token = $matches[1];
        }
        
        if (!$token) {
            return Services::response()
                ->setJSON([
                    'error' => 'Unauthorized',
                    'message' => 'Invalid authorization header format. Expected Bearer <token>.'
                ])
                ->setStatusCode(401);
        }
        
        $decoded = JWT::decode($token);
        if (!$decoded) {
            return Services::response()
                ->setJSON([
                    'error' => 'Unauthorized',
                    'message' => 'Access token has expired or is invalid.'
                ])
                ->setStatusCode(401);
        }
        
        // Populate static user registry
        AuthService::setUser($decoded);

        // Access control check for production_admin
        if (isset($decoded['role']) && strtolower($decoded['role']) === 'production_admin') {
            $uri = $request->getUri()->getPath();
            // Allow api/multiskill, api/auth, and api/discussions
            if (strpos($uri, 'api/multiskill') === false && strpos($uri, 'api/auth') === false && strpos($uri, 'api/discussions') === false && strpos($uri, 'api/users') === false) {
                return Services::response()
                    ->setJSON([
                        'error' => 'Forbidden',
                        'message' => 'Access Denied: Production Admin can only access the Multi Skill and Discussion modules.'
                    ])
                    ->setStatusCode(403);
            }
        }
        
        return $request;
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // No post-processing action needed
    }
}
