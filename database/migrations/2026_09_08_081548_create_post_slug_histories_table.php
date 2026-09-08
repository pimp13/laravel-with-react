<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('post_slug_histories', function (Blueprint $table) {
            $table->id();

            $table->foreignId('post_id')
                ->constrained('posts')
                ->cascadeOnDelete();

            $table->string('slug', 255);

            $table->timestamps();

            /*
             * یک slug نباید دوبار برای یک post ثبت شود.
             */
            $table->unique([
                'post_id',
                'slug',
            ]);

            /*
             * برای پیدا کردن سریع post بر اساس slug قدیمی.
             */
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('post_slug_histories');
    }
};
