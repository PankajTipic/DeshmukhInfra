<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductMedia;
use App\Models\ProductSize;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Helpers\Util;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;
use App\Helpers\ImageCompressor;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;



class ProductController extends Controller
{
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
  
    public function index()
    {
        $user = Auth::user();
        
        // Fetch only products, media, and sizes that belong to the user's company
        $products = Product::where('company_id', $user->company_id)->get();
        $medias = ProductMedia::where('company_id', $user->company_id)->get();
        $sizes = ProductSize::where('company_id', $user->company_id)->get();
    
        $newProducts = array();
        foreach ($products as $product) {
            // Filter media and sizes by product_id
            $product->media = Util::getFilteredArray($product->id, $medias, 'product_id');
            $product->sizes = Util::getFilteredArray($product->id, $sizes, 'product_id');
            array_push($newProducts, $product);
        }
        
        return $newProducts;
    }
 public function store(Request $request)
{
    $user = Auth::user();
    $request->validate([
       'name' => [
        'required',
        Rule::unique('products')->where(fn ($q) => $q->where('company_id', $user->company_id)),
    ],
   'localName'=>'',
        'slug' => 'required',
        'categoryId' => 'required',
        'incStep' => 'required',
        'desc' => 'nullable',
        'multiSize' => 'required',
        'show' => 'required'
    ]);

    $user = Auth::user();
    
    // Create the product with company_id and created_by
    $product = Product::create([
        'name' => $request->name,
        'slug' => $request->slug,
        'categoryId' => $request->categoryId,
        'incStep' => $request->incStep,
        'desc' => $request->desc,
        'unit' => $request->unit,
        'multiSize' => $request->multiSize,
        'show' => $request->show,
        'showOnHome' => $request->showOnHome,
        'company_id' => $user->company_id, // Add company_id
        'created_by' => $user->id, // Add created_by
        'updated_by' => $user->id ,// Add updated by
        'localName'=> $request->localName,
    ]);

    // Save images with company_id and created_by
    $images = array();
    foreach ($request->media as $img) {
        $media = new ProductMedia;
        $media->url = $img['url'];
        $media->type = $img['type'];
        $media->company_id = $user->company_id; // Add company_id
        array_push($images, $media);
    }
    $product->media()->saveMany($images);

    // Save sizes with company_id and created_by
    $sizes = array();
    foreach ($request->sizes as $size) {
        $sz = new ProductSize;
        $sz->name = $size['name'];
        $sz->localName = $size['localName'];
        
        // Store prices as strings to preserve decimal formatting
        $sz->oPrice = $size['oPrice']; // Keep as string
        $sz->bPrice = $size['oPrice']; // Keep as string
        
        $sz->stock = $size['stock'];
        
        if (isset($size['dPrice']) && $size['dPrice']) {
            $sz->dPrice = $size['dPrice']; // Keep as string
        }
        
        $sz->qty = $size['qty'];
        $sz->show = $size['show'];
        $sz->company_id = $user->company_id; // Add company_id
        array_push($sizes, $sz);
    }
    $product->size()->saveMany($sizes);

    return $product;
}


    

    /**
     * Store a new stock
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function newStock(Request $request)
    {
        //newStock
        $sizes = array();
        foreach($request->products as $product){
            foreach($product['sizes'] as $size){
                if(isset($size['id']) && isset($size['newStock'])){
                    ProductSize::where('id', $size['id'])
                    ->update([
                        'qty'=> DB::raw('qty+'.$size['newStock']),
                        'stock'=> DB::raw('stock+'.$size['newStock'])
                    ]);
                }
            }
        }
        return true;
    }

    /**
     * Store a new stock
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    // public function stock(Request $request)
    // {
    //     $user = Auth::user();
    //     // $sizes = ProductSize::where('company_id', $user->company_id)->get();
    //     $sizes = ProductSize::with('product:id,showOnHome') // Assuming you have a relationship defined in ProductSize
    //     ->where('company_id', $user->company_id)
    //     ->get();
    //     return $sizes;
    // }
public function stock(Request $request)
{
    $user = Auth::user();

    $sizes = ProductSize::with([
        'product' => function ($q) {
            $q->select('id', 'name', 'showOnHome'); // Include more fields if needed
            $q->with('media'); // Load images
        }
    ])
    ->where('company_id', $user->company_id)
    ->get();

    return $sizes;
}

    /**
     * Display the specified resource.
     *
     * @param  integer $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $product = Product::find($id);
        $product->media = $product->media;
        $product->sizes = $product->size;
        return $product;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $product = Product::find($id);
        $product->update($request->all());
        //Save images
        foreach($request->media as $img){
            if(isset($img['id'])){
                $media = ProductMedia::firstOrNew(array('id' => $img['id']));
                $media->id = $img['id'];
                $media->product_id = $img['product_id'];
                $media->url = $img['url'];
                $media->type = $img['type'];
                $media->show = $img['show'];
                $media ->save();
            }else{
                $media = new ProductMedia;
                $media->url = $img['url'];
                $media->type = $img['type'];
                $product->media()->save($media);
            }
        }

        // $sizes = array();
        foreach($request->sizes as $size){
            //print_r($img);
            if(isset($size['id'])){
                $sz = ProductSize::firstOrNew(array('id' => $size['id']));
                $sz->id = $size['id'];
                $sz->product_id = $size['product_id'];
                $sz->name = $size['name'];
                $sz->localName = $size['localName'];
                $sz->oPrice = $size['oPrice'];
                $sz->dPrice = $size['dPrice'];
                $sz->bPrice = $size['dPrice'];
                $sz->qty =  $size['qty'];
                $sz->stock =  $size['stock'];
                $sz->show = $size['show'];
                $sz->save();
            }else{
                $sz = new ProductSize;
                $sz->name = $size['name'];
                $sz->localName = $size['localName'];
                $sz->oPrice = $size['oPrice'];
                $sz->dPrice = $size['dPrice'];
                $sz->qty = $size['qty'];
                $sz->stock = $size['stock'];
                $sz->show = $size['show'];
                
                $product->sizes = $product->size()->save($sz);
            }
        }
        
        return $product;
    }


    public function updateQty(Request $request)
    {
        // Validate request inputs
        $request->validate([
            'id' => 'required|exists:product_sizes,id',
            'qty' => 'required|integer|min:0',
            // 'show' => 'nullable|integer'
        ]);
        
        $productSize = ProductSize::find($request->id);
        // $products = Product::find($request->id);
        
        if ($productSize ) {
            // Update quantity if provided
            if ($request->filled('qty')) {
                $productSize->qty = $productSize->qty + $request->qty;
                //TODO: stock update
            }

            // Save the updated product size
            $productSize->save();
        
            $productSize = ProductSize::find($request->id);

            return response()->json([
                'success' => true,
                'message' => 'Quantity updated successfully.',
                'product' => $productSize,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Product size not found.'
        ], 404);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  integer  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        Product::destroy($id);
        return ProductSize::where('product_id',$id)->delete();
    }

   public function updateQuantity(Request $request, $id)
{
    $request->validate([
        'size_id' => 'required|exists:product_sizes,id',
        'added_qty' => 'required|integer|min:1', // disallow zero/negative
    ]);

    $productSize = ProductSize::where('product_id', $id)
        ->where('id', $request->size_id)
        ->first();

    if (!$productSize) {
        return response()->json([
            'success' => false,
            'message' => 'Product size not found.',
        ], 404);
    }

    // Calculate new stock after adding the quantity
    $newStock = $productSize->stock + $request->added_qty;

    // Check if new stock would exceed total quantity
    if ($newStock > $productSize->qty) {
        return response()->json([
            'success' => false,
            'message' => 'Cannot add stock. New stock (' . $newStock . ') would exceed total quantity (' . $productSize->qty . ').',
        ], 400);
    }

    // Update only stock (not qty)
    $productSize->stock = $newStock;
    $productSize->save();

    return response()->json([
        'success' => true,
        'message' => 'Stock updated successfully.',
        'product_size' => $productSize,
    ]);
}



// Fixed uploadProductImage method
public function uploadProductImage(Request $request)
{
    $request->validate([
        'product_id' => 'required|exists:products,id',
        'image' => 'required|image|mimes:jpeg,jpg,png,webp,gif,bmp,tiff,svg,heic,heif,ico,avif,jfif|max:5120',
        'description' => 'nullable|string',
    ]);

    $product = Product::findOrFail($request->product_id);
    $user = Auth::user();

    if ($product->company_id !== $user->company_id) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $imageUrl = ImageCompressor::compressAndSave($request->file('image'), 'product');

    ProductMedia::create([
        'product_id' => $product->id,
        'company_id' => $user->company_id,
        'url' => $imageUrl,
        'type' => 'image',
        'show' => true,
        'description' => $request->input('description'),
    ]);

    return response()->json([
        'message' => 'Image uploaded successfully',
        'url' => $imageUrl,
    ]);
}


public function uploadMultipleImages(Request $request)
{
    Log::info('Upload request data:', [
        'all' => $request->all(),
        'files' => $request->hasFile('images') ? 'Images present' : 'No images',
        'product_id' => $request->input('product_id'),
    ]);

    $request->validate([
        'product_id' => 'required|exists:products,id',
        'images.*' => 'required|image|mimes:jpeg,jpg,png,webp,gif,bmp,tiff,svg,heic,heif,ico,avif,jfif|max:5120',
        'descriptions' => 'nullable|array',
        'descriptions.*' => 'nullable|string',
    ]);

    $productId = $request->input('product_id');

    if (!$productId) {
        Log::error('Product ID is missing from request');
        return response()->json(['error' => 'Product ID is required'], 400);
    }

    $product = Product::findOrFail($productId);
    $user = Auth::user();

    if ($product->company_id !== $user->company_id) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $uploadedUrls = [];

    if ($request->hasFile('images')) {
        $images = $request->file('images');
        $descriptions = $request->input('descriptions', []);

        foreach ($images as $index => $image) {
            $url = ImageCompressor::compressAndSave($image, 'product');

            Log::info('Creating ProductMedia with:', [
                'product_id' => $productId,
                'company_id' => $user->company_id,
                'url' => $url
            ]);

            ProductMedia::create([
                'product_id' => $productId,
                'company_id' => $user->company_id,
                'url' => $url,
                'type' => 'image',
                'show' => true,
                'description' => $descriptions[$index] ?? null,
            ]);

            $uploadedUrls[] = $url;
        }
    }

    return response()->json([
        'message' => 'Images uploaded successfully',
        'urls' => $uploadedUrls
    ]);
}

public function updateDescription(Request $request, $id)
{
    $request->validate([
        'description' => 'nullable|string'
    ]);

    $media = ProductMedia::findOrFail($id);

    // Optional: Check company ownership
    if ($media->company_id !== Auth::user()->company_id) {
        return response()->json(['error' => 'Unauthorized'], 403);
    }

    $media->description = $request->description;
    $media->save();

    return response()->json(['message' => 'Description updated']);
}

public function getProductSizesStock(Request $request)
{
    $ids = explode(',', $request->query('ids'));

    $sizes = \App\Models\ProductSize::whereIn('id', $ids)
        ->select('id', 'stock')
        ->get();

    return response()->json(['data' => $sizes]);
}





}
