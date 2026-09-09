<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;

class GuestMiddleware
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        try {
            $token = $request->cookie(config('auth.cookie_name'));

            if (!$token) {
                return $next($request);
            }

            JWTAuth::setToken($token);

            if (JWTAuth::check()) {
                return response()->json([
                    'success' => false,
                    'message' => 'You are already authenticated.',
                ], 403);
            }
        } catch (\Throwable $e) {
            return $next($request);
        }

        return $next($request);
    }
}
