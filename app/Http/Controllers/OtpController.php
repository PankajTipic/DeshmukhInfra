<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class OtpController extends Controller
{
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users,email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $otpCode = rand(100000, 999999);
        $user->otp_code = $otpCode;
        $user->otp_expires_at = Carbon::now('Asia/Kolkata')->addMinutes(10);
        $user->save();

        Mail::to($user->email)->send(new \App\Mail\OtpMail($otpCode));

        return response()->json(['message' => 'OTP sent to your email.']);
    }

    //Verify otp
    public function verifyOtp(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:users,email',
        'otp' => 'required|string',
    ]);

    $user = User::where('email', $request->email)->first();

    if (!$user || $user->otp_code !== (string)$request->otp) {
        return response()->json(['message' => 'Invalid OTP.'], 422);
    }

    if (Carbon::now()->greaterThan($user->otp_expires_at)) {
        return response()->json(['message' => 'OTP has expired.'], 422);
    }

    // OTP is valid, authenticate or take the next step
    $user->otp_code = null;
    $user->otp_expires_at = null;
    $user->save();

    return response()->json(['message' => 'OTP verified successfully.'],201);
}

}

