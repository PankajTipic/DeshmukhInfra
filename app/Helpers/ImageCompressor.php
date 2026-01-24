<?php

namespace App\Helpers;

use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class ImageCompressor
{
    /**
     * Compress and save the image/PDF to a custom public_html directory.
     *
     * @param \Illuminate\Http\UploadedFile $image
     * @param string $folder
     * @param int $maxSizeKB
     * @return string
     * @throws \Exception
     */
    public static function compressAndSave($image, $folder = 'product', $maxSizeKB = 1024)
    {
        try {
            // Validate file extension
            $extension = strtolower($image->getClientOriginalExtension());

            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'pdf'])) {
                throw new \Exception('Unsupported file format: ' . $extension);
            }

            // Generate unique filename
            $filename = Str::uuid() . '.' . $extension;

            // Define full public_html path
            $publicPath = $_SERVER['DOCUMENT_ROOT'] . '/img/' . $folder;

            // Ensure directory exists
            if (!file_exists($publicPath)) {
                mkdir($publicPath, 0755, true);
            }

            $savePath = "{$publicPath}/{$filename}";

            // Handle PDF files separately (no compression)
            if ($extension === 'pdf') {
                $image->move($publicPath, $filename);
                
                if (!file_exists($savePath)) {
                    throw new \Exception('Failed to save PDF file');
                }
                
                return "img/{$folder}/{$filename}";
            }

            // Use Intervention Image Manager for images
            $manager = new ImageManager(new Driver());
            $imageObj = $manager->read($image->getRealPath());

            // Resize if image width exceeds 1600px
            if ($imageObj->width() > 1600) {
                $imageObj->scale(width: 1600);
            }

            $quality = 90;

            // Compress image iteratively until target size is reached
            do {
                $imageObj->save($savePath, $quality);
                
                if (!file_exists($savePath)) {
                    throw new \Exception('Failed to save image file');
                }

                $sizeKB = filesize($savePath) / 1024;
                $quality -= 10;

            } while ($sizeKB > $maxSizeKB && $quality >= 50);

            // Return relative path to store in DB
            return "img/{$folder}/{$filename}";

        } catch (\Exception $e) {
            Log::error('Image/PDF upload failed: ' . $e->getMessage());
            throw new \Exception('Failed to process file: ' . $e->getMessage());
        }
    }
}