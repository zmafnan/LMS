<?php

namespace App\Libraries;

class JWT
{
    /**
     * Generate JWT Token
     *
     * @param array $payload
     * @param int $expiry Seconds (default 24 hours)
     * @return string
     */
    public static function generate(array $payload, int $expiry = 86400): string
    {
        $secret = env('jwt.secret', 'lms_secure_secret_key_2026_modern_industrial_style');
        
        $header = json_encode([
            'alg' => 'HS256',
            'typ' => 'JWT'
        ]);
        
        $payload['exp'] = time() + $expiry;
        $payload['iat'] = time();
        
        $base64UrlHeader = self::base64UrlEncode($header);
        $base64UrlPayload = self::base64UrlEncode(json_encode($payload));
        
        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        $base64UrlSignature = self::base64UrlEncode($signature);
        
        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    /**
     * Decode and Validate JWT Token
     *
     * @param string $token
     * @return array|null Null if invalid or expired
     */
    public static function decode(string $token): ?array
    {
        $secret = env('jwt.secret', 'lms_secure_secret_key_2026_modern_industrial_style');
        
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return null;
        }
        
        list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
        
        // Validate Signature
        $signature = self::base64UrlDecode($base64UrlSignature);
        $expectedSignature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            return null;
        }
        
        $payload = json_decode(self::base64UrlDecode($base64UrlPayload), true);
        if (!$payload) {
            return null;
        }
        
        // Check Expiration
        if (isset($payload['exp']) && time() > $payload['exp']) {
            return null;
        }
        
        return $payload;
    }

    private static function base64UrlEncode(string $data): string
    {
        return str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($data));
    }

    private static function base64UrlDecode(string $data): string
    {
        $remainder = strlen($data) % 4;
        if ($remainder) {
            $data .= str_repeat('=', 4 - $remainder);
        }
        return base64_decode(str_replace(['-', '_'], ['+', '/'], $data));
    }
}
