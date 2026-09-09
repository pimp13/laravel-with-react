<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class ResolveJwtUserMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $token = $request->cookie(config('auth.cookie_name'));

        if (!$token) {
            return $next($request);
        }

        try {
            $user = JWTAuth::setToken($token)->authenticate();

            if ($user) {
                $request->setUserResolver(
                    fn() => $user
                );
            }
        } catch (JWTException) {
            // Token is invalid or expired.
            // This middleware must not block the request.
        }

        return $next($request);
    }
}
