<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
     // Creates a new user account and issues an API token
    public function register(Request $request)
    {
        // Validate input; email must be unique in the users table
        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
        ]);
        
        // Save the new user record
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
        ]);
        // Generate a Sanctum token so the user is logged in right after signup
        $token = $user->createToken('auth_token')->plainTextToken;

        // 201 = resource created
        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
            'token' => $token,
        ], 201);
    }
    // Authenticates an existing user and returns a fresh token
    public function login(Request $request)
    {
        // Only email and password are needed here
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);
        // Look up the account by email
        $user = User::where('email', $request->email)->first();

        // Reject if no user found or the password doesn't match the stored hash
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password'
            ], 401);
        }
        // Issue a new token for this login session
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }
    // Revokes only the token used in the current request
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ]);
    }
    // Returns the profile of whoever owns the token sent in the request
    public function user(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }
}