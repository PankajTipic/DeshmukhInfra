<?php

namespace App\Http\Controllers;
use App\Models\Scrapping;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;
 
class ScrappingController extends Controller
{
 
    //Send OTP to visitor
    public function sendOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
 
        $otp = rand(100000, 999999);
        $expiryTime = Carbon::now()->addMinutes(10);
 
        $enquiry = Scrapping::updateOrCreate(
            ['email' => $request->email],
            ['otp' => $otp, 'otp_expires_at' => $expiryTime, 'is_verified' => false]
        );
 
        Mail::to($request->email)->send(new \App\Mail\CustomerVerifyOtp($enquiry));
 
        return response()->json(['message' => 'OTP sent to your email.'], 201);
    }
 
   
    //Verify the otp
    public function verifyOTP(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'otp' => 'required|digits:6',
    ]);
 
    $enquiry = Scrapping::where('email', $request->email)->first();
 
    if (!$enquiry) {
        return response()->json(['message' => 'Enquiry not found.'], 404);
    }
 
    if ($enquiry->otp !== $request->otp) {
        return response()->json(['message' => 'Invalid OTP.'], 400);
    }
 
    if (Carbon::now()->greaterThan($enquiry->otp_expires_at)) {
        return response()->json(['message' => 'OTP expired.'], 400);
    }
 
    // Mark enquiry as verified and update the message
    $enquiry->update([
        'name' => $request->name,
        'is_verified' => true,
        'otp' => null,
        'otp_expires_at' => null,
    ]);
 
    return response()->json(['message' => 'Email verified and enquiry submitted successfully!'], 200);
}
 
 //Submit data after verification
 public function submitEnquiry(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'name' => 'required|string|max:255',
        'mobile' => 'required|string|max:15',
        'location' => 'required|string|max:255',
        'vehicle_category' => 'required|string|max:255',
        'vehicle_company' => 'required|string|max:255',
        'vehiclename' => 'required|string|max:255',
    ]);
 
    // Check if email is verified
    // $enquiry = Scrapping::where('email', $request->email)->first();
 
    // if (!$enquiry) {
    //     return response()->json(['message' => 'Email not found.'], 404);
    // }
 
    // if (!$enquiry->is_verified) {
    //     return response()->json(['message' => 'Email is not verified. Please verify OTP first.'], 403);
    // }
 
    // Update existing record with the additional details
 
    $enquiry = Scrapping::create($request->all());
 
    // $enquiry->update([
    //     'name' => $request->name,
    //     'mobile' => $request->mobile,
    //     'location' => $request->location,
    //     'vehicle_category' => $request->vehicle_category,
    //     'vehicle_company' => $request->vehicle_company,
    //     'vehiclename' => $request->vehiclename,
    // ]);
 
    return response()->json(['message' => 'Enquiry submitted successfully!'], 200);
 
   
}
 
}
