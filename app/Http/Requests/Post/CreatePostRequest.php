<?php

namespace App\Http\Requests\Post;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'slug' => [
                'nullable',
                'string',
                'max:255',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
            ],

            'content' => [
                'required',
                'string',
            ],

            'excerpt' => [
                'nullable',
                'string',
                'max:500',
            ],

            'is_active' => [
                'sometimes',
                'boolean',
            ],

            'user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'category_id' => [
                'nullable',
                'integer',
                'exists:categories,id',
            ],

            'visibility' => [
                'required',
                Rule::in([
                    'public',
                    'private',
                    'password',
                ]),
            ],

            'published_at' => [
                'nullable',
                'date',
            ],

            'tag' => [
                'nullable',
                'string',
                'max:255',
            ],

            'meta' => [
                'nullable',
                'array',
            ],

            'featured_image' => [
                'nullable',
                'image',
                'mimes:jpeg,jpg,png,webp,avif',
                'max:5120',
            ],
        ];
    }
}
