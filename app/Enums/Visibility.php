<?php

namespace App\Enums;

enum Visibility: string
{
    case General  = 'general';
    case Private  = 'private';
    case Limited  = 'limited';

    public function label(): string
    {
        return match ($this) {
            self::General  => 'عمومی',
            self::Private  => 'خصوصی',
            self::Limited  => 'محدود',
        };
    }
}
