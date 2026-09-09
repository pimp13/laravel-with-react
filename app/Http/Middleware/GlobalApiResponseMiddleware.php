<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class GlobalApiResponseMiddleware
{
    public function handle(
        Request $request,
        Closure $next
    ): Response {
        $response = $next($request);

        if (!$response instanceof JsonResponse) {
            return $response;
        }

        $data = $response->getData(true);

        $user = $request->user();

        $data['meta'] = array_merge(
            [
                'isLoginUser' => $user !== null,
                'loginUser' => $user,
            ],
            $data['meta'] ?? []
        );

        $response->setData($data);

        return $response;
    }
}
