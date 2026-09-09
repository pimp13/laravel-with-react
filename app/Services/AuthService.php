<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthService
{
    public function __construct()
    {
        //
    }

    public function authenticate(
        string $email,
        string $password,
        ?string $name = null
    ): array {
        $user = User::where('email', $email)->first();
        if (!$user) {
            $user = User::create([
                'name' => $name ?? 'Anonymous',
                'email' => $email,
                'password' => Hash::make($password)
            ]);
        } else {
            if (!Hash::check($password, $user->password)) {
                throw ValidationException::withMessages([
                    'email' => 'The provided credentials are incorrect.'
                ]);
            }
        }
        $token = JWTAuth::fromUser($user);
        return [
            'user' => $user,
            'token' => $token,
        ];
    }
}
