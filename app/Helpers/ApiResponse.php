<?php

namespace App\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(
        mixed $data = null,
        string $message = 'Success',
        int $status = 200,
        array $meta = [],
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
            'meta' => self::meta($meta),
        ], $status);
    }

    public static function error(
        string $message = 'Something went wrong',
        int $status = 400,
        mixed $data = null,
        array $meta = [],
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data' => $data,
            'meta' => self::meta($meta),
        ], $status);
    }

    private static function meta(array $meta = []): array
    {
        $user = request()->user();

        return array_merge([
            'isLoginUser' => $user !== null,
            'loginUser' => $user,
        ], $meta);
    }
}
