<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use League\Csv\Reader;
use League\Csv\Statement;

class CsvUploadController extends Controller
{
    
public function uploadProducts(Request $request)
{
    // Validate that a CSV file is provided
    $request->validate([
        'csv_file' => 'required|file|mimes:csv,txt',
    ]);

    $user = Auth::user();

    // Get the CSV file path
    $path = $request->file('csv_file')->getRealPath();
    $csv = Reader::createFromPath($path, 'r');
    $csv->setHeaderOffset(0); // The first row is treated as header

    // Get headers to validate
    $headers = $csv->getHeader();
    $requiredHeaders = ['name', 'localname','sPrice', 'quantity','stock'];
    
    // Check if required headers exist in the CSV (allows additional headers)
    foreach ($requiredHeaders as $requiredHeader) {
        if (!in_array($requiredHeader, $headers)) {
            return response()->json([
                'error' => "CSV file must contain the header: '{$requiredHeader}'"
            ], 422);
        }
    }

    // Process the CSV records
    $records = Statement::create()->process($csv);

    DB::beginTransaction();
    try {
        foreach ($records as $row) {
            // Create the product in the products table
            $product = Product::create([
                'name' => $row['name'],
                'slug' => Str::slug($row['name']), // Create proper slug
                'categoryId' => 0, // Default category ID
                'incStep' => 1, // Default increment step
                'desc' => $row['name'], // Default description from name
                'unit' => '', // Default unit (empty)
                'multiSize' => 0, // Default to 0 (no multiple sizes)
                'show' => 1, // Default to 1 (show product)
                'showOnHome' => 1, // Default to 1 (show on home)
                'company_id' => $user->company_id,
                'created_by' => $user->id,
                'updated_by' => $user->id,
                'localName' => $row['localname'], // Using the name as local name
            ]);

            // Create the size
            $size = new ProductSize();
            $size->name = $row['name']; // Using the name as the size name
            $size->localName = $row['localname']; // Using the name as the local size name
            $size->oPrice = floatval($row['sPrice']); // Convert to float
            $size->bPrice = floatval($row['sPrice']); // Convert to float
            $size->dPrice = floatval($row['sPrice']); // Same as oPrice
            $size->qty = intval($row['quantity']); // Convert to integer
            $size->stock = intval($row['stock']); // Set stock equal to quantity
            $size->show = 1; // Default to 1 (show product)
            $size->company_id = $user->company_id;

            // Save the size for the product
            $product->size()->save($size);
        }

        DB::commit(); // Commit the transaction
        return response()->json(['message' => 'Products uploaded successfully.'], 200);
    } catch (\Exception $e) {
        DB::rollBack(); // Rollback in case of an error
        return response()->json(['error' => 'Failed to upload CSV: ' . $e->getMessage()], 500);
    }
}
}
