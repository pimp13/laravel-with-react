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
        if ($request->user()) {
            return response()->json([
                'success' => false,
                'message' => 'Authenticated users are not allowed.',
                'data' => null,
            ], 403);
        }

        return $next($request);
    }
}
