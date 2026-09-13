<?php

if (! function_exists('generateUsername')) {
    function generateUsername(
        string $prefix = '',
        string $suffix = '',
        int $bytes = 4,
        int $randomMin = 100,
        int $randomMax = 999,
    ): string {
        do {
            $random = bin2hex(random_bytes($bytes)) . '_' . random_int($randomMin, $randomMax);

            $value = $prefix . $random . $suffix;
        } while (\App\Models\User::where('username', $value)->exists());

        return $value;
    }
}
