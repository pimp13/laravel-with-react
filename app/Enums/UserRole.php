<?php

namespace App\Enums;

enum UserRole: string
{
    case SUPER_ADMIN = 'super_admin';
    case EDITOR = 'editor';
    case AUTHOR = 'author';
    case CONTRIBUTOR = 'contributor';
    case SUBSCRIBER = 'subscriber';

    public function label(): string
    {
        return match ($this) {
            self::SUPER_ADMIN  => 'مدیرکل',
            self::EDITOR  => 'ویرایشگر',
            self::AUTHOR  => 'نویسنده',
            self::CONTRIBUTOR => 'مشارکت‌کننده',
            self::SUBSCRIBER => 'مشترک',
        };
    }
}
