<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

// Manage system user accounts and roles via database
class UserController extends Controller
{
    // List all registered users
    public function index(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'role', 'active', 'created_at')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($users);
    }

    // Create a new user in the database
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6',
            'role' => 'required|in:admin,manager,staff',
            'active' => 'sometimes|boolean',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => strtolower($validated['role']),
            'active' => $validated['active'] ?? true,
        ]);

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $user,
        ], 201);
    }

    // View specific user profile
    public function show(User $user): JsonResponse
    {
        return response()->json($user);
    }

    // Update user profile or role in database
    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6',
            'role' => 'sometimes|required|in:admin,manager,staff',
            'active' => 'sometimes|boolean',
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        if (isset($validated['role'])) {
            $validated['role'] = strtolower($validated['role']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $user,
        ]);
    }

    // Delete a user from database
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully.',
        ]);
    }
}
