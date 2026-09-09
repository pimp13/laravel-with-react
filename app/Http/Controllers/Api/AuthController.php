<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AuthRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

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

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user,
            ],
        ]);
    }


    public function register(AuthRequest $request): JsonResponse
    {
        $bodyData = $request->validated();
        $result = $this->authService->register($bodyData);
        return response()->json([
            'success' => true,
            'message' => 'register user is successfully!',
            'data' => $result,
        ]);
    }

    public function login(AuthRequest $request): JsonResponse
    {
        $result = $this->authService->login($request->validated());
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
            'message' => 'ورود به حساب کاربری موفقیت آمیز بود',
            'data' => [
                'user' => $result['user'],
            ],
        ])->withCookie($cookie);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->cookie(config('auth.cookie_name'));

        if (!$token) {
            return response()->json([
                'success' => true,
                'message' => 'خروج از حساب کاربری موفقیت آمیز بود'
            ])->withoutCookie(config('auth.cookie_name'));
        }
        try {
            JWTAuth::setToken($token)->invalidate();
        } finally {
            return response()->json([
                'success' => true,
                'message' => 'خروج از حساب کاربری موفقیت آمیز بود'
            ])->withoutCookie(config('auth.cookie_name'));
        }
    }
}
