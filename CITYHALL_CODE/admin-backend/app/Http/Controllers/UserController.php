<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    // Update user (admin)
    public function update(Request $request, $id)
    {
        $authUser = $request->user();
        $user = User::findOrFail($id);
        // Only superadmins can update admin/superadmin accounts
        if (($user->role === 'admin' || $user->role === 'super_admin') && $authUser->role !== 'super_admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        // Regular admins can only update their own profile (not password)
        if ($authUser->role === 'admin' && $authUser->id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        $data = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|max:255|unique:users,email,' . $id,
            'department' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8|confirmed',
        ]);
        // Only superadmins can change admin/superadmin passwords
        if (isset($data['password'])) {
            if (($user->role === 'admin' || $user->role === 'super_admin') && $authUser->role !== 'super_admin') {
                return response()->json(['error' => 'Forbidden'], 403);
            }
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }
        $user->update($data);
        Log::info('User updated', [
            'by_user_id' => $authUser->id,
            'by_user_role' => $authUser->role,
            'target_user_id' => $user->id,
            'target_user_role' => $user->role,
            'action' => 'update',
        ]);
        return response()->json(['status' => true, 'message' => 'User updated', 'data' => $user]);
    }

    // Delete user (admin)
    public function destroy(Request $request, $id)
    {
        $authUser = $request->user();
        $user = User::findOrFail($id);
        // Only superadmins can delete admin/superadmin accounts
        if (($user->role === 'admin' || $user->role === 'super_admin') && $authUser->role !== 'super_admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        // Regular admins can only delete their own account
        if ($authUser->role === 'admin' && $authUser->id !== $user->id) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        $user->delete();
        Log::info('User deleted', [
            'by_user_id' => $authUser->id,
            'by_user_role' => $authUser->role,
            'target_user_id' => $user->id,
            'target_user_role' => $user->role,
            'action' => 'delete',
        ]);
        return response()->json(['status' => true, 'message' => 'User deleted']);
    }

    // List all users
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }
}
