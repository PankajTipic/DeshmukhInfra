<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\ApiKey;
use App\Models\FakeApiUser;
use Illuminate\Support\Facades\Auth;

class ApiKeyMiddleware
{
    public function handle($request, Closure $next)
    {
        // ✅ 1. If already authenticated via Sanctum, do nothing
        if (Auth::guard('sanctum')->check()) {
            return $next($request);
        }

        // ✅ 2. Otherwise, check API key
        $header = $request->header('Authorization');

        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return response()->json(['error' => 'Unauthorized - missing API key'], 401);
        }

        $token = substr($header, 7);

        $apiKey = ApiKey::where('key', $token)->first();

        if (!$apiKey) {
            return response()->json(['error' => 'Unauthorized - invalid API key'], 401);
        }

        // ✅ 3. Inject FakeApiUser (with type=0 by default)
        Auth::onceUsingId(0); // temporary, request only
        $fakeUser = new FakeApiUser();
        $fakeUser->type = 0;
        Auth::setUser($fakeUser);

        return $next($request);
    }
}
