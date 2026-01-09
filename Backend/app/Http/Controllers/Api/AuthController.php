<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserWeb;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    private function jsonResponse($data, $status = 200)
    {
        return response()->json($data, $status);
    }

    public function login(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string',
                'password' => 'required|string',
            ]);
        } catch (ValidationException $e) {
            return $this->jsonResponse([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => $e->errors(),
            ], 422);
        }

        $user = UserWeb::where('username', $request->username)->first();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Username not found.',
            ], 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Invalid password.',
            ], 401);
        }

        if ($user->is_ban == '1' || $user->is_ban === 1) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Your account has been banned.',
            ], 403);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'token' => $token,
                'id' => $user->id,
                'username' => $user->username,
            ],
        ], 200);
    }

    public function register(Request $request)
    {
        try {
            $request->validate([
                'username' => 'required|string|unique:user_web,username|min:3|max:50',
                'password' => 'required|string|min:6',
                'name' => 'nullable|string|max:255',
                'avarta' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
        } catch (ValidationException $e) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        $avatarPath = null;
        if ($request->hasFile('avarta')) {
            $avatar = $request->file('avarta');
            $filename = time() . '_' . uniqid() . '.' . $avatar->getClientOriginalExtension();
            $avatarPath = $avatar->storeAs('avatars', $filename, 'public');
        }

        $user = UserWeb::create([
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'name' => $request->name ?? $request->username,
            'is_member' => '0',
            'is_ban' => '0',
            'is_admin' => 0,
            'is_restric' => null,
            'avarta' => $avatarPath,
        ]);

        $token = $user->createToken('api-token')->plainTextToken;

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'token' => $token,
                'id' => $user->id,
                'username' => $user->username,
            ],
        ], 201);
    }

    public function profile(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Profile retrieved successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'is_member' => ($user->is_member == '1' || $user->is_member === 1) ? 1 : 0,
                'is_admin' => ((int)$user->is_admin > 0) ? 1 : 0,
                'is_ban' => ($user->is_ban == '1' || $user->is_ban === 1) ? 1 : 0,
                'is_restric' => $user->is_restric,
                'avarta' => $user->avarta ? url('storage/' . $user->avarta) : null,
                'created_at' => $user->created_at?->toDateTimeString(),
                'updated_at' => $user->updated_at?->toDateTimeString(),
            ],
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        try {
            $request->validate([
                'name' => 'nullable|string|max:255',
                'username' => 'nullable|string|min:3|max:50|unique:user_web,username,' . $user->id,
                'avarta' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ]);
        } catch (ValidationException $e) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        $updateData = [];

        if ($request->has('name')) {
            $updateData['name'] = $request->name;
        }

        if ($request->has('username')) {
            $updateData['username'] = $request->username;
        }

        if ($request->hasFile('avarta')) {
            if ($user->avarta && Storage::disk('public')->exists($user->avarta)) {
                Storage::disk('public')->delete($user->avarta);
            }

            $avatar = $request->file('avarta');
            $filename = time() . '_' . uniqid() . '.' . $avatar->getClientOriginalExtension();
            $avatarPath = $avatar->storeAs('avatars', $filename, 'public');
            $updateData['avarta'] = $avatarPath;
        }

        $user->update($updateData);
        $user->refresh();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
                'is_member' => ($user->is_member == '1' || $user->is_member === 1) ? 1 : 0,
                'is_admin' => ((int)$user->is_admin > 0) ? 1 : 0,
                'is_ban' => ($user->is_ban == '1' || $user->is_ban === 1) ? 1 : 0,
                'is_restric' => $user->is_restric,
                'avarta' => $user->avarta ? url('storage/' . $user->avarta) : null,
                'created_at' => $user->created_at?->toDateTimeString(),
                'updated_at' => $user->updated_at?->toDateTimeString(),
            ],
        ], 200);
    }

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        try {
            $request->validate([
                'old_password' => 'required|string',
                'new_password' => 'required|string|min:6',
            ]);
        } catch (ValidationException $e) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        }

        if (!Hash::check($request->old_password, $user->password)) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Old password is incorrect',
            ], 400);
        }

        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Password updated successfully',
        ], 200);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Logout successful',
        ], 200);
    }
}
