<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\AuthRequest;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
        return ApiResponse::success(
            data: [
                'user' => $result['user'],
                '__token' => $result['token'],
            ],
            message: 'authenticate is successfully!'
        )->withCookie($cookie);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        return ApiResponse::success(data: ['user' => $user]);
    }


    public function register(AuthRequest $request): JsonResponse
    {
        $bodyData = $request->validated();
        $result = $this->authService->register($bodyData);
        return ApiResponse::success(
            data: $result,
            message: 'register user is successfully!',
        );
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
        return ApiResponse::success(
            data: [
                'user' => $result['user'],
            ],
            message: 'ورود به حساب کاربری موفقیت آمیز بود'
        )->withCookie($cookie);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->cookie(config('auth.cookie_name'));

        if (!$token) {
            return ApiResponse::success(
                message: 'خروج از حساب کاربری موفقیت آمیز بود'
            )->withoutCookie(config('auth.cookie_name'));
        }
        try {
            JWTAuth::setToken($token)->invalidate();
        } finally {
            return ApiResponse::success(
                message: 'خروج از حساب کاربری موفقیت آمیز بود'
            )->withoutCookie(config('auth.cookie_name'));
        }
    }
}
