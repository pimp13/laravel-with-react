<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRequest;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct(
        private readonly UserService $userService
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $users = $this->userService->findAll();
        return ApiResponse::success(data: $users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(UserRequest $request)
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User created successfully',
            'data' => $user,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $user = User::findOrFail($id);
        User::destroy($user->id);
        return response()->json([
            'success' => true,
            'message' => 'user is deleted successfully',
        ]);
    }

    public function changeStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean']
        ]);
        $user->is_active = $validated['is_active'];
        $user->save();
        return response()->json([
            'success' => true,
            'message' => 'user status is changed!',
            'data' => [
                'userId' => $user->id,
                'isActive' => $user->is_active
            ]
        ]);
    }

    public function showPage(): Response
    {
        $resp = Http::get('http://localhost:3000')->json();
        $users = $this->userService->findAll();
        return Inertia::render('panel/users/index', [
            'users' => $users,
            'cowsay' => $resp['cowsay']
        ]);
    }
}
