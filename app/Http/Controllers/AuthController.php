<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Models\Otp;

use Illuminate\Support\Facades\Cache;
use App\Notifications\SendOtpNotification;
use Illuminate\Validation\ValidationException;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Notification;


class AuthController extends Controller
{
    function register(Request $request){
        $fields = $request->validate([
            'name' => 'required|string',
            'mobile' => 'required|string|unique:users',
            'type' => 'required',
            'email' => 'nullable|string|unique:users,email',
            'password' => 'required|string|confirmed',
            'company_id' => 'required'
        ]);

        $user = User::create([
            'name'=> $fields['name'],
            'email'=> $fields['email'],
            'mobile'=> $fields['mobile'],
            'type'=> $fields['type'],
            'company_id'=> $fields['company_id'],
            'password'=> bcrypt($fields['password'])
        ]);

        $token = $user->createToken('webapp')->plainTextToken;
        $response = [
            'user'=> $user,
            'token'=> $token
        ];
        return response($response,201);
    }

    function update(Request $request){
        $fields = $request->validate([
            'id' => 'required',
            'name' => 'required|string',
            'mobile' => 'required',
            'type' => 'required',
            'email' => 'required',
            'company_id' => 'required',
            'blocked'=> 'required',
        ]);
        $user = User::where('id',$fields['id'])->first();
        $user->update([
            'name'=> $request->name,
            'mobile'=> $request->mobile,
            'type'=> $request->type,
            'company_id' => $request->company_id, 
            'blocked' => $request->blocked,
            // 'updated_by' => $user->id, 
        ]);
        $user->save();
        return response()->json([
            'success' => true,
            'message' => 'Updated successfully.',
            'user' => $user,
        ]);
    }

//     public function login(Request $request)
// {
//     $fields = $request->validate([
//         'email' => 'required|string', // This will accept email or mobile
//         'password' => 'required|string'
//     ]);

//     // Find user by email OR mobile
//     $user = User::with(['CompanyInfo'])
//         ->where('email', $fields['email'])
//         ->orWhere('mobile', $fields['email'])
//         ->first();

//     // Check password
//     if (!$user || !Hash::check($fields['password'], $user->password)) {
//         return response()->json([
//             'message' => 'Invalid credentials'
//         ], 401);
//     }

//     // Check if user is blocked
//     if ($user->blocked == 1) {
//         return response()->json([
//             'message' => 'User not allowed. Kindly contact admin.',
//             'blocked' => true
//         ], 201);
//     }

//     // Check if company is blocked
//     if ($user->CompanyInfo && $user->CompanyInfo->block_status == 1) {
//         return response()->json([
//             'message' => 'Company not allowed. Kindly contact admin.',
//             'blocked' => true
//         ], 201);
//     }

//     // Generate token
//     $token = $user->createToken('webapp')->plainTextToken;

//     return response()->json([
//         'user' => $user,
//         'token' => $token
//     ], 201);
// }




// public function login(Request $request)
// {
//     $fields = $request->validate([
//         'email' => 'required|string', // This will accept email or mobile
//         'password' => 'required|string'
//     ]);

//     // Find user by email OR mobile
//     $user = User::with(['CompanyInfo'])
//         ->where('email', $fields['email'])
//         ->orWhere('mobile', $fields['email'])
//         ->first();

//     // Check password
//     if (!$user || !Hash::check($fields['password'], $user->password)) {
//         return response()->json([
//             'message' => 'Invalid credentials'
//         ], 401);
//     }

//     // Check if user is blocked
//     if ($user->blocked == 1) {
//         return response()->json([
//             'message' => 'User not allowed. Kindly contact admin.',
//             'blocked' => true
//         ], 201);
//     }

//     // Check if company is blocked
//     if ($user->CompanyInfo && $user->CompanyInfo->block_status == 1) {
//         return response()->json([
//             'message' => 'Company not allowed. Kindly contact admin.',
//             'blocked' => true
//         ], 201);
//     }

//     // ✅ Add subscribed_plan_name dynamically
//     if ($user->CompanyInfo && $user->CompanyInfo->subscribed_plan) {
//         $planName = DB::table('plans')
//                       ->where('id', $user->CompanyInfo->subscribed_plan)
//                       ->value('name');

//         // Append to the CompanyInfo model
//         $user->CompanyInfo->subscribed_plan_name = $planName;
//     }

//     // Generate token
//     $token = $user->createToken('webapp')->plainTextToken;

//     return response()->json([
//         'user' => $user,
//         'token' => $token
//     ], 201);
// }


public function login(Request $request)
{
    $fields = $request->validate([
        'email'    => 'required|string',   // can be email OR mobile
        'password' => 'required|string'
    ]);

    // 🔹 Find user by email or mobile and eager-load full company info
    $user = User::with('CompanyInfo')
        ->where(function($q) use ($fields) {
            $q->where('email', $fields['email'])
              ->orWhere('mobile', $fields['email']);
        })
        ->first();

    // 🔹 Check credentials
    if (!$user || !Hash::check($fields['password'], $user->password)) {
        return response()->json([
            'message' => 'Invalid credentials'
        ], 401);
    }

    // 🔹 Block checks
    if ($user->blocked == 1) {
        return response()->json([
            'message' => 'User not allowed. Kindly contact admin.',
            'blocked' => true
        ], 201);
    }

    if ($user->CompanyInfo && $user->CompanyInfo->block_status == 1) {
        return response()->json([
            'message' => 'Company not allowed. Kindly contact admin.',
            'blocked' => true
        ], 201);
    }

    // 🔹 Add subscribed plan name to company info
    if ($user->CompanyInfo && $user->CompanyInfo->subscribed_plan) {
        $planName = DB::table('plans')
            ->where('id', $user->CompanyInfo->subscribed_plan)
            ->value('name');

        // Append dynamic attribute (shows in JSON)
        $user->CompanyInfo->subscribed_plan_name = $planName ?? null;
    }

    // 🔹 Create token
    $token = $user->createToken('webapp')->plainTextToken;

    // 🔹 Return user + company info + token
    return response()->json([
        'user'         => $user,
        'company_info' => $user->CompanyInfo, // ✅ full company info here
        'token'        => $token
    ], 201);
}











    function mobileLogin(Request $request){
        $fields = $request->validate([
            'mobile' => 'required|string',
            'password' => 'required|string'
        ]);

        //Check if mobile no exists
        $user = User::where('mobile',$fields['mobile'])->first();

        //Check password
        if(!$user || !Hash::check($fields['password'], $user->password)){
            return response->json([
                'message'=>'Please provide valid credentials'
            ],401);
        }

        if($user->blocked == 1){
            return response([
                'message'=>'Kindly contact admin'
            ],401);
        }

        $token = $user->createToken('mobileLoginToken')->plainTextToken;
        $response = [
            'user'=> $user,
            'token'=> $token
        ];
        return response($response,201);
    }

    public function logout(Request $request)
{
    $request->user()->currentAccessToken()->delete();

    return response()->json([
        'message' => 'Logged out from current session'
    ], 200);
}

public function logoutEverywhere(Request $request)
{
    $request->user()->tokens()->delete();

    return response()->json([
        'message' => 'Logged out from all devices'
    ], 200);
}

    function changePassword(Request $request){
        $fields = $request->validate([
            'email' => 'required|string',
            'password' => 'required|string',
            'new_password' => 'required|string',
        ]);

        //Check if email exists
        $user = User::where('email',$fields['email'])->first();

        //Check password
        if(!$user || !Hash::check($fields['password'], $user->password)){
            return response([
                'message'=>'Please provide valid credentials'
            ],401);
        }else{
            $user->password =  bcrypt($fields['new_password']);
            $user->save();
            auth()->user()->tokens()->delete();
        }

        $token = $user->createToken('webapp')->plainTextToken;
        $response = [
            'Message'=> 'Password Changed Successfully,Login with new Password',
            'status'=> 1
            // 'user'=> $user,
            // 'token'=> $token
        ];
        return response($response,200);
    }

    public function allUsers(Request $request)
    {
        $companyId = Auth::user()->company_id;
    
        if ($request->customers == 'true') {
            // Filter users by company_id and type
            return User::where('type', 10)
                       ->where('company_id', $companyId)
                       ->paginate(50);
        }
        
        // Filter users by company_id and type < 10
        return User::where('type', '<', 10)
                   ->where('company_id', $companyId)
                   ->paginate(50);
    }
    
    function registerUser(Request $request){
        $fields = $request->validate([
            'name' => 'required|string',
            'mobile' => 'required|string|unique:users,mobile',
            'type' => 'required',
            'email' => 'required|string|unique:users,email',
            'password' => 'required|string|confirmed'
        ]);

        $user = User::create([
            'name'=> $fields['name'],
            'email'=> $fields['email'],
            'mobile'=> $fields['mobile'],
            'type'=> $fields['type'],
            'password'=> bcrypt($fields['password'])
        ]);
        return response($user,201);
    }

    public function deleteUser($id)
    {
        // Only Admins or Super Admins can delete
        if (auth()->user()->type !== 1 && auth()->user()->type !== 0) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized access.'
            ], 403);
        }
    
        $user = User::find($id);
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.'
            ], 404);
        }
    
        $user->delete();
    
        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.'
        ]);
    }
    









  /**
 * POST /api/auth/otp/send
 * body: { email }
 */
public function send(Request $request)
{
    $data = $request->validate([
        'email' => ['required','email','max:255'],
    ]);

    $email = strtolower($data['email']);

    // Basic rate limit: 5 requests per 15 minutes per email
    $key = 'otp_rl_'.sha1($email);
    if (Cache::get($key, 0) >= 5) {
        throw ValidationException::withMessages([
            'email' => 'Too many requests. Try again later.',
        ]);
    }
    Cache::put($key, Cache::get($key, 0) + 1, now()->addMinutes(15));

    // Generate a 6-digit numeric code
    $code = (string) random_int(100000, 999999);
    $ttl = (int) config('auth.otp_ttl', 10); // minutes

    // Save hashed OTP
    Otp::create([
        'email' => $email,
        'code_hash' => Hash::make($code),
        'expires_at' => now()->addMinutes($ttl),
    ]);

    // Send email
    $notifiable = User::where('email', $email)->first() ?? new class($email) {
         use Notifiable;
        public function __construct(public string $email) {}
        public function routeNotificationForMail() { return $this->email; }
    };
    $notifiable->notify(new SendOtpNotification($code, $ttl));

    return response()->json([
        'message' => 'OTP sent if the email exists.',
        'ttl_minutes' => $ttl,
    ]);
}


/**
 * POST /api/auth/otp/verify
 * body: { email, code }
 */
// public function verify(Request $request)
// {
//     $data = $request->validate([
//         'email' => ['required','email','max:255'],
//         'code' => ['required','digits:6'],
//     ]);

//     $email = strtolower($data['email']);
//     $code  = $data['code'];

//     // Find latest active OTP
//     $otp = Otp::where('email', $email)
//         ->whereNull('consumed_at')
//         ->where('expires_at', '>', now())
//         ->latest('id')
//         ->first();

//     if (! $otp) {
//         throw ValidationException::withMessages([
//             'code' => 'Code expired or not found. Request a new one.',
//         ]);
//     }

//     // Check attempt limit
//     if ($otp->attempts >= config('auth.otp_max_attempts', 5)) {
//         throw ValidationException::withMessages([
//             'code' => 'Too many attempts. Request a new code.',
//         ]);
//     }

//     // Verify code
//     if (! Hash::check($code, $otp->code_hash)) {
//         $otp->increment('attempts');
//         throw ValidationException::withMessages([
//             'code' => 'Invalid code.',
//         ]);
//     }

//     // Mark as consumed
//     $otp->update(['consumed_at' => now()]);

//     // Find or create user
//     $user = User::firstOrCreate(
//         ['email' => $email],
//         ['name' => strstr($email, '@', true) ?: $email, 'password' => '']
//     );

    

//     // Return success with token if Sanctum installed
//     if (class_exists(\Laravel\Sanctum\PersonalAccessToken::class)) {
//         $token = $user->createToken('otp-login')->plainTextToken;
//         return response()->json([
//             'message' => 'Verified.',
//             'token' => $token,
//             'user' => $user,
//         ]);
//     }

//     // Else login via session
//     auth()->login($user);
//     return response()->json([
//         'message' => 'Verified.',
//         'user' => $user,
//     ]);
// }


public function verify(Request $request)
{
    $data = $request->validate([
        'email' => ['required','email','max:255'],
        'code'  => ['required','digits:6'],
    ]);

    $email = strtolower($data['email']);
    $code  = $data['code'];

    // Find latest active OTP
    $otp = Otp::where('email', $email)
        ->whereNull('consumed_at')
        ->where('expires_at', '>', now())
        ->latest('id')
        ->first();

    if (! $otp) {
        throw ValidationException::withMessages([
            'code' => 'Code expired or not found. Request a new one.',
        ]);
    }

    // Check attempt limit
    if ($otp->attempts >= config('auth.otp_max_attempts', 5)) {
        throw ValidationException::withMessages([
            'code' => 'Too many attempts. Request a new code.',
        ]);
    }

    // Verify code
    if (! \Hash::check($code, $otp->code_hash)) {
        $otp->increment('attempts');
        throw ValidationException::withMessages([
            'code' => 'Invalid code.',
        ]);
    }

    // Mark as consumed
    $otp->update(['consumed_at' => now()]);

    // Find or create user
    $user = User::firstOrCreate(
        ['email' => $email],
        ['name' => strstr($email, '@', true) ?: $email, 'password' => '']
    );

    // ✅ Load company info
    $user->load('CompanyInfo');

    // Return success with token if Sanctum installed
    if (class_exists(\Laravel\Sanctum\PersonalAccessToken::class)) {
        $token = $user->createToken('otp-login')->plainTextToken;
        return response()->json([
            'message'      => 'Verified.',
            'token'        => $token,
            'user'         => $user,
            'company_info' => $user->CompanyInfo, // ✅ Company info added
        ]);
    }

    // Else login via session
    auth()->login($user);
    return response()->json([
        'message'      => 'Verified.',
        'user'         => $user,
        'company_info' => $user->CompanyInfo, // ✅ Company info added
    ]);
}












// Get all users with type = 2 from logged-in user's company
    public function getCompanyType2Users(Request $request)
    {
        // Get logged in user
        $loggedInUser = Auth::user();

        if (!$loggedInUser) {
            return response()->json([
                'status' => false,
                'message' => 'User not authenticated'
            ], 401);
        }

        // Fetch users from same company_id with type = 2
        $users = User::where('company_id', $loggedInUser->company_id)
            ->where('type', 2)
            ->get();

        return response()->json([
            'status' => true,
            'company_id' => $loggedInUser->company_id,
            'users' => $users
        ], 200);
    }





public function userUpdated(Request $request)
{
    $fields = $request->validate([
        'id' => 'required',
        'name' => 'required|string',
        'mobile' => 'required',
        'type' => 'required',
        'email' => 'required|email',
        'company_id' => 'required',
        'blocked'=> 'required',
    ]);

    $user = User::findOrFail($fields['id']);

    $user->update([
        'name'       => $request->name,
        'mobile'     => $request->mobile,
        'type'       => $request->type,
         'email'      => $request->email,
        'company_id' => $request->company_id, 
        'blocked'    => $request->blocked,
        'updated_by' => auth()->id(), // 👈 logged-in user who updated
    ]);

    return response()->json([
        'success' => true,
        'message' => 'Updated successfully.',
        'user'    => $user,
    ]);
}





}
