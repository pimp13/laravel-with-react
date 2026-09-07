<?php

namespace App\Http\Requests\Post;

use App\Enums\Visibility;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdatePostRequest extends FormRequest
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
            'slug' => 'nullable|string|min:4|max:190|unique:posts,slug',
            'content' => 'required',
            'is_active' => 'nullable|boolean',
            'user_id' => 'required|numeric|exists:users,id',
            'category_id' => 'required|numeric|exists:categories,id',
            'visibility' => ['required', Rule::enum(Visibility::class)],
            'excerpt' => 'nullable|string',
            'published_at' => 'nullable|date',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ];
    }
}
