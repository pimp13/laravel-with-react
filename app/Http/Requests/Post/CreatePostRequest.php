<?php

namespace App\Http\Requests\Post;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CreatePostRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|min:4|max:190',
            'slug' => 'required|string|min:4|max:190|unique:posts,slug',
            'content' => 'required',
            'is_active' => 'nullable|boolean',
            'user_id' => 'required|numeric|exists:users,id',
            'category_id' => 'required|numeric|exists:categories,id',
            'visibility' => 'required|',
            'excerpt',
            'published_at',
            'featured_image',
        ];
    }
}
