<?php

namespace App\Services;

use App\Models\AppSetting;
use App\Models\QrTokenUse;
use App\Models\User;
use Carbon\Carbon;
use RuntimeException;

class QrTokenService
{
    /**
     * Generate a cryptographic dynamic QR token for a student.
     */
    public function generateToken(User $student): array
    {
        $ttl = (int) AppSetting::get('qr_token_ttl_seconds', 60);
        $timestamp = now()->timestamp;
        $expiresAt = $timestamp + $ttl;

        $payload = [
            'u' => $student->uuid,
            't' => $timestamp,
            'exp' => $expiresAt,
        ];

        $payloadJson = json_encode($payload);
        $signature = hash_hmac('sha256', $payloadJson, config('app.key'));

        $tokenString = base64_encode(json_encode([
            'p' => $payload,
            's' => $signature,
        ]));

        return [
            'token' => $tokenString,
            'ttl' => $ttl,
            'expires_at' => $expiresAt,
        ];
    }

    /**
     * Verify and decode a dynamic QR token.
     *
     * @return array [success: bool, user: ?User, error: ?string, token_hash: ?string]
     */
    public function verifyToken(string $tokenString): array
    {
        try {
            $decoded = json_decode(base64_decode($tokenString), true);
            if (!$decoded || !isset($decoded['p']) || !isset($decoded['s'])) {
                return ['success' => false, 'error' => 'Format token QR tidak valid.'];
            }

            $payload = $decoded['p'];
            $signature = $decoded['s'];

            // 1. Verify HMAC signature
            $expectedSignature = hash_hmac('sha256', json_encode($payload), config('app.key'));
            if (!hash_equals($expectedSignature, $signature)) {
                return ['success' => false, 'error' => 'Tanda tangan token QR tidak valid.'];
            }

            // 2. Verify expiration window with tolerance
            $tolerance = (int) AppSetting::get('qr_token_tolerance_seconds', 15);
            $expiresAt = $payload['exp'] ?? 0;
            $now = now()->timestamp;

            if ($now > ($expiresAt + $tolerance)) {
                return ['success' => false, 'error' => 'QR kedaluwarsa. Silakan refresh QR di perangkat siswa.'];
            }

            // 3. Prevent replay attacks via qr_token_uses table (AC-D2)
            $tokenHash = hash('sha256', $tokenString);
            if (QrTokenUse::where('token_hash', $tokenHash)->exists()) {
                return ['success' => false, 'error' => 'QR sudah digunakan.'];
            }

            // 4. Resolve student
            $student = User::where('uuid', $payload['u'])->first();
            if (!$student) {
                return ['success' => false, 'error' => 'Data siswa pemilik QR tidak ditemukan.'];
            }

            return [
                'success' => true,
                'user' => $student,
                'token_hash' => $tokenHash,
                'expires_at' => $expiresAt,
            ];
        } catch (\Throwable $e) {
            return ['success' => false, 'error' => 'Terjadi kesalahan saat memvalidasi QR: ' . $e->getMessage()];
        }
    }
}
