<?php

use App\Enums\Visibility;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();

            $table->string('title', 200);

            $table->string('slug', 255)
                ->unique();

            $table->text('content');

            $table->string('excerpt', 500)
                ->nullable();

            $table->string('featured_image')
                ->nullable();

            $table->enum(
                'visibility',
                array_column(Visibility::cases(), 'value')
            )
                ->default(Visibility::General->value)
                ->index();

            $table->boolean('is_active')
                ->default(true)
                ->index();

            $table->timestamp('published_at')
                ->nullable()
                ->index();

            $table->jsonb('meta')
                ->nullable();

            $table->foreignId('user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('category_id')
                ->nullable()
                ->constrained('categories')
                ->nullOnDelete();

            $table->timestamps();

            $table->index([
                'is_active',
                'visibility',
                'published_at',
            ]);

            $table->index([
                'category_id',
                'published_at',
            ]);

            $table->index([
                'user_id',
                'published_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
