<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
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
            'title' => 'required|string|min:3|max:190',
            'slug' => 'required|string|unique:categories,slug|max:190',
            'is_active' => 'nullable|boolean',
            'parent_id' => 'numeric|exists:categories,id|nullable',
            'description' => 'nullable|string|max:255',
        ];
    }
}
