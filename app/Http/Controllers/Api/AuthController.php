<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuthRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(
        private readonly AuthService $authService
    ) {}

    public function authenticate(AuthRequest $request): JsonResponse
    {
        $result = $this->authService->authenticate(
            email: strtolower($request->string('email')->toString()),
            password: $request->string('password')->toString(),
            name: $request->input('name'),
        );
        $cookie = cookie(
            name: config('auth.cookie_name'),
            value: $result['token'],
            minutes: config('auth.cookie_ttl'),
            path: '/',
            domain: null,
            secure: app()->isProduction(),
            httpOnly: true,
            raw: false,
            sameSite: 'lax',
        );
        return response()->json([
            'success' => true,
            'message' => 'authenticate is successfully!',
            'data' => [
                'user' => $result['user'],
                '__token' => $result['token'],
            ]
        ])->withCookie($cookie);
    }
}
