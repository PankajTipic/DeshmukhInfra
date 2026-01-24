<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\JarTracker;
use App\Models\PaymentTracker;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    protected $user;

    public function __construct()
    {
        $this->user = Auth::user();
    }

    /**
     * Get cache key for customer search based on company and user type
     */
    private function getCustomerCacheKey($companyId, $userType)
    {
        if ($userType == 0) {
            return 'customers_all';
        } else {
            return 'customers_company_' . $companyId;
        }
    }

    /**
     * Get cached customers or fetch from database
     */
    private function getCachedCustomers($companyId, $userType)
    {
        $cacheKey = $this->getCustomerCacheKey($companyId, $userType);
        
        return Cache::rememberForever($cacheKey, function () use ($companyId, $userType) {
            if ($userType == 0) {
                return Customer::all();
            } else {
                return Customer::where('company_id', $companyId)->get();
            }
        });
    }

    /**
     * Clear customer cache
     */
    private function clearCustomerCache($companyId = null, $userType = null)
    {
        // If specific company and user type provided, clear that cache
        if ($companyId !== null && $userType !== null) {
            $cacheKey = $this->getCustomerCacheKey($companyId, $userType);
            Cache::forget($cacheKey);
        } else {
            // Clear all customer caches
            Cache::forget('customers_all');
            
            // Clear all company-specific caches - you may need to adjust this based on your setup
            $companies = Customer::distinct('company_id')->pluck('company_id');
            foreach ($companies as $compId) {
                Cache::forget('customers_company_' . $compId);
            }
        }
    }

    /**
     * Add customer to cache
     */
    private function addCustomerToCache($customer, $companyId, $userType)
    {
        $cacheKey = $this->getCustomerCacheKey($companyId, $userType);
        $cachedCustomers = Cache::get($cacheKey, collect());
        
        // Add new customer to cached collection
        $cachedCustomers->push($customer);
        
        // Update cache
        Cache::forever($cacheKey, $cachedCustomers);
        
        // If user type is not admin (0), also update the admin cache
        if ($userType != 0) {
            $adminCacheKey = $this->getCustomerCacheKey(null, 0);
            $adminCachedCustomers = Cache::get($adminCacheKey, collect());
            $adminCachedCustomers->push($customer);
            Cache::forever($adminCacheKey, $adminCachedCustomers);
        }
    }

    /**
     * Update customer in cache
     */
    private function updateCustomerInCache($customer, $companyId, $userType)
    {
        $cacheKey = $this->getCustomerCacheKey($companyId, $userType);
        $cachedCustomers = Cache::get($cacheKey, collect());
        
        // Update customer in cached collection
        $updatedCustomers = $cachedCustomers->map(function ($cachedCustomer) use ($customer) {
            if ($cachedCustomer->id == $customer->id) {
                return $customer;
            }
            return $cachedCustomer;
        });
        
        // Update cache
        Cache::forever($cacheKey, $updatedCustomers);
        
        // If user type is not admin (0), also update the admin cache
        if ($userType != 0) {
            $adminCacheKey = $this->getCustomerCacheKey(null, 0);
            $adminCachedCustomers = Cache::get($adminCacheKey, collect());
            $updatedAdminCustomers = $adminCachedCustomers->map(function ($cachedCustomer) use ($customer) {
                if ($cachedCustomer->id == $customer->id) {
                    return $customer;
                }
                return $cachedCustomer;
            });
            Cache::forever($adminCacheKey, $updatedAdminCustomers);
        }
    }

    /**
     * Remove customer from cache
     */
    private function removeCustomerFromCache($customerId, $companyId, $userType)
    {
        $cacheKey = $this->getCustomerCacheKey($companyId, $userType);
        $cachedCustomers = Cache::get($cacheKey, collect());
        
        // Remove customer from cached collection
        $filteredCustomers = $cachedCustomers->filter(function ($cachedCustomer) use ($customerId) {
            return $cachedCustomer->id != $customerId;
        });
        
        // Update cache
        Cache::forever($cacheKey, $filteredCustomers);
        
        // If user type is not admin (0), also update the admin cache
        if ($userType != 0) {
            $adminCacheKey = $this->getCustomerCacheKey(null, 0);
            $adminCachedCustomers = Cache::get($adminCacheKey, collect());
            $filteredAdminCustomers = $adminCachedCustomers->filter(function ($cachedCustomer) use ($customerId) {
                return $cachedCustomer->id != $customerId;
            });
            Cache::forever($adminCacheKey, $filteredAdminCustomers);
        }
    }

    /**
     * Clear all customer caches - public method for manual cache clearing
     */
    public function clearCache()
    {
        $this->clearCustomerCache();
        return response()->json(['message' => 'Customer cache cleared successfully']);
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;
        
        return $this->getCachedCustomers($companyId, $userType);
    }

    public function search(Request $request)
{
    $request->validate([
        'searchQuery' => 'nullable|string'
    ]);

    $user = Auth::user();
    $companyId = $user->company_id;
    $userType = $user->type;
    $searchQuery = $request->query('searchQuery'); // can be null or ""

    // Get cached customers
    $customers = $this->getCachedCustomers($companyId, $userType);

    // If no searchQuery, return all customers
    if (empty($searchQuery)) {
        return $customers->values();
    }

    // Filter customers based on search query
    if ($userType == 0) {
        // For admin/super user → search by name only
        return $customers->filter(function ($customer) use ($searchQuery) {
            return stripos($customer->name, $searchQuery) !== false;
        })->values();
    } else {
        // For regular users → search by name or mobile
        return $customers->filter(function ($customer) use ($searchQuery) {
            return stripos($customer->name, $searchQuery) !== false || 
                   stripos($customer->mobile, $searchQuery) !== false;
        })->values();
    }
}


    public function history(Request $request)
    {
        $request->validate([
            'id' => 'required|string'
        ]);
    
        $user = Auth::user();
        $companyId = $user->company_id;
        $id = $request->query('id');
    
        $returnEmptyProducts = JarTracker::where('customer_id', $id)->get();
        $paymentTrackerSum = PaymentTracker::where('customer_id', $id)->sum('amount');
    
        // ✅ Fetch last 2 orders with items
        $recentOrders = Order::with('items')
            ->where('customer_id', $id)
            ->orderBy('id', 'desc')
            ->take(2)
            ->get();
    
        $lastOrders = $recentOrders->map(function ($order) {
            return [
                'order_id' => $order->id,
                'created_at' => $order->created_at->toDateTimeString(),
                'items' => $order->items->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'product_local_name' => $item->product_local_name,
                        'product_sizes_id' => $item->product_sizes_id,
                        'size_name' => $item->size_name,
                        'size_local_name' => $item->size_local_name,
                        'dPrice' => $item->dPrice,
                        'dQty' => $item->dQty,
                        'returnable' => $item->returnable ?? 0,
                    ];
                }),
            ];
        });
    
        return response()->json([
            'returnEmptyProducts' => $returnEmptyProducts,
            'pendingPayment' => $paymentTrackerSum * -1,
            'lastOrders' => $lastOrders,
        ]);
    }
    
    public function creditReport(Request $request)
    {
        $user = Auth::user();
        $companyId = $user->company_id; // Get the company_id of the authenticated user

        // Eager load PaymentTracker and JarTracker relationships
        $customers = Customer::with(['paymentTracker'])
            ->where('company_id', $companyId)
            ->get();

        $creditReports = [];

        foreach ($customers as $customer) {
            if ($customer->paymentTracker) {
                $customerData = [
                    'name' => $customer->name,
                    'mobile' => $customer->mobile,
                    'address' => $customer->address,
                    'totalPayment' => $customer->paymentTracker->amount,
                    'customerId' => $customer->id, // Add customer_id here
                    
                ];

                $creditReports[] = $customerData;
            }
        }

        return response()->json($creditReports);
    }
   
    
    public function resetAllPayments()
    {
        $user = Auth::user();
        // Get all distinct customer IDs
        $distinctCustomerIds = PaymentTracker::distinct('customer_id')->pluck('customer_id');

        // Initialize an array to hold the new payment entries
        $newPayments = [];

        // Loop through each distinct customer ID to calculate the sum
        foreach ($distinctCustomerIds as $customerId) {
            $paymentSum = PaymentTracker::where('customer_id', $customerId)->sum('amount');
            // Prepare the new payment entry
            $newPayments[] = [
                'customer_id' => $customerId,
                'amount' => $paymentSum,
                'isCredit' => ($paymentSum < 0),
                'created_by' => $user->id,
                'updated_by' => $user->id,
            ];
        }

        // Delete all entries in the PaymentTracker table
        PaymentTracker::truncate();

        // Insert the new payment entries
        PaymentTracker::insert($newPayments);

        return response()->json([
            'message' => 'All entries deleted and new entries added with the sums for each customer.',
            'new_payments' => $newPayments
        ]);
    }

    public function booking(Request $request)
    {
        // Validate the input to ensure the 'searchQuery' field is a string
        $request->validate([
            'id' => 'required|string'
        ]);

        $user = Auth::user();
        $companyId = $user->company_id;
        $id = $request->query('id'); 
        $orders = Order::with(['items'])->where('company_id', $user->company_id)->where('invoiceType',2)->where('orderStatus',2)->where('customer_id',$id)->get();
        return $orders;
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'name'=> 'required|string',
            'mobile' => [
                'required',
                'string',
                Rule::unique('customers')->where('company_id', $request->company_id),
            ],
            'show'=> 'required',
            'company_id' => 'required'
        ]);
        
        $customer = Customer::create($request->all());
        
        // Add customer to cache
        $user = Auth::user();
        $this->addCustomerToCache($customer, $user->company_id, $user->type);
        
        return $customer;
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;
        
        // Get from cache first
        $customers = $this->getCachedCustomers($companyId, $userType);
        $customer = $customers->where('id', $id)->first();
        
        if (!$customer) {
            // Fallback to database if not found in cache
            if ($userType == 0) {
                $customer = Customer::find($id);
            } else {
                $customer = Customer::where('company_id', $companyId)->find($id);
            }
        }
        
        return $customer;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;

        $request->validate([
            'name'=> 'required|string',
            'mobile'=> 'required|string',
            'show'=> 'required',
            'company_id' => 'required'
        ]);
        
        if ($userType == 0) {
            $customer = Customer::find($id);
            $customer->update($request->all());
        } else {
            $customer = Customer::where('company_id', $companyId)->find($id);
            $customer->update($request->all());
        }
        
        // Update customer in cache
        $this->updateCustomerInCache($customer->fresh(), $companyId, $userType);
        
        return $customer;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $companyId = $user->company_id;
        $userType = $user->type;
        
        $result = false;
        
        if ($userType == 0) {
            $result = Customer::destroy($id);
        } else {
            // Destroy if company id matches
            $result = Customer::where('company_id', $companyId)->where('id', $id)->delete();
        }
        
        // Remove customer from cache if deletion was successful
        if ($result) {
            $this->removeCustomerFromCache($id, $companyId, $userType);
        }
        
        return $result;
    }

   public function bulkCustomerCreation(Request $request){
    $user = Auth::user();
    $customers = $request->json()->all();
    $customerIds = [];
    $createdCustomers = [];
    
    foreach ($customers as $index => $customer) {
        // Validation
        $validator = Validator::make($customer, [
            'name' => 'required|string',
            'mobile' => [
                'required',
                'string',
                Rule::unique('customers')->where(function ($query) use ($customer) {
                    return $query->where('company_id', $customer['company_id']);
                }),
            ],
            'address' => 'nullable|string',
            'credit' => 'nullable|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => "Mobile no taken ".$customer['mobile'],
                'errors' => $validator->errors(),
            ], 422);
        }
    }

    foreach ($customers as $customer) {
        $customer['created_by'] = $user->id;
        $customer['updated_by'] = $user->id;
        $customer['show'] = 1;
        
        // Save customer in DB and get generated id
        $savedCustomer = Customer::create($customer);
        $customerIds[] = $savedCustomer->id;
        $createdCustomers[] = $savedCustomer; // Store created customer for cache update
        
        // Handle credit if provided
        if (isset($customer['credit']) && $customer['credit'] > 0) {
            $credit = -1 * $customer['credit'];

            // Create new payment tracker object, set amount, id and save
            $paymentTracker = new PaymentTracker();
            $paymentTracker->customer_id = $savedCustomer->id;
            $paymentTracker->amount = $credit;
            $paymentTracker->isCredit = 1;
            $paymentTracker->created_by = $user->id;
            $paymentTracker->updated_by = $user->id;
            $paymentTracker->save();
        }
    }
    
    // Update cache with new customers
    foreach ($createdCustomers as $customer) {
        $this->addCustomerToCache($customer, $user->company_id, $user->type);
    }
    
    return response()->json([
        'success'=> true,
        'customers' => $customerIds,
        'message' => count($customerIds) . ' customers created successfully'
    ]);
}
}