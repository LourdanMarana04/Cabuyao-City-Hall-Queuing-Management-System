<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string|min:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials'
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'status' => false,
                'message' => 'Account is deactivated'
            ], 401);
        }

        // Update last login time
        $user->update(['last_login_at' => now()]);

        // Create token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'status' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'department' => $user->department,
                    'position' => $user->position,
                ],
                'token' => $token,
                'token_type' => 'Bearer'
            ]
        ], 200);
    }

    /**
     * Logout user (revoke token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => true,
            'message' => 'Successfully logged out'
        ], 200);
    }

    /**
     * Get authenticated user profile
     */
    public function profile(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'status' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'position' => $user->position,
                'last_login_at' => $user->last_login_at,
            ]
        ], 200);
    }

    /**
     * Update authenticated user profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }

        // Update user profile
        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        // Log the profile update
        Log::info('User profile updated', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'action' => 'update_profile',
            'updated_fields' => ['name', 'email'],
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Profile updated successfully',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'position' => $user->position,
            ]
        ], 200);
    }

    /**
     * Register new user (for admin use)
     */
    public function register(Request $request)
    {
        $authUser = $request->user();
        $isPublic = !$authUser;
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'required|in:admin,super_admin,user',
            'department' => 'nullable|string|max:255',
            'position' => 'nullable|string|max:255',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => false,
                'message' => 'Validation error',
                'errors' => $validator->errors()
            ], 422);
        }
        // Only superadmins can create admin/super_admin accounts
        if ($isPublic && $request->role !== 'user') {
            return response()->json(['status' => false, 'message' => 'Only superadmins can create admin or superadmin accounts.'], 403);
        }
        if (!$isPublic && ($request->role === 'admin' || $request->role === 'super_admin') && $authUser->role !== 'super_admin') {
            return response()->json(['status' => false, 'message' => 'Only superadmins can create admin or superadmin accounts.'], 403);
        }
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'department' => $request->department,
            'position' => $request->position,
        ]);
        Log::info('User registered', [
            'by_user_id' => $authUser ? $authUser->id : null,
            'by_user_role' => $authUser ? $authUser->role : 'public',
            'target_user_id' => $user->id,
            'target_user_role' => $user->role,
            'action' => 'register',
        ]);
        return response()->json([
            'status' => true,
            'message' => 'User created successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'department' => $user->department,
                'position' => $user->position,
            ]
        ], 201);
    }
}
