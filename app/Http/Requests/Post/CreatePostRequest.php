<?php

namespace App\Http\Requests\Post;

use App\Enums\Visibility;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePostRequest extends FormRequest
{
    public function authorize(): bool
    {
        // dd($this->user());
        // return $this->user() !== null;
        return true;
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
                Rule::in(Visibility::cases()),
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
                'string',
                'url',
                'max:2048',
            ],
        ];
    }
}
