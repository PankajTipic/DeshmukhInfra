<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;

class WhatsAppController extends Controller
{
    // Direct values (replace with your actual credentials)
    private $accessToken = 'EAAXDOdIVS2ABO0pcYo6OZCMESZCtXJZCnnj7zIcBQTJNCwjT5i1JBtmH0WxcEbLmLnElrepsRGZBT9thPqkLF4SYWk0I4I9GupWz30ZBSYoxNZCAYNWxByBZCv2f4JNgE5cUZBl9dAgoRlJuMtE4bZABGn6cPZAiUG2vMVOap1myLd24sZBhro9CwDeoZBZBGgSIasvpr5QZDZD';
    private $phoneNumberId = '482346864961658'; // WhatsApp Business Phone Number ID

    public function sendBill(Request $request)
    {
        try {
            $phoneNumber = $request->input('phone_number');
            $billFile = $request->file('bill_file');

            if (!$phoneNumber || !$billFile) {
                return response()->json(['error' => 'Phone number and bill file are required'], 400);
            }

            // Format phone number to E.164: +91XXXXXXXXXX
            $phoneNumber = preg_replace('/\D/', '', $phoneNumber); // Remove non-digits
            if (substr($phoneNumber, 0, 2) !== '91') {
                $phoneNumber = '91' . $phoneNumber;
            }
            $phoneNumber = '+' . $phoneNumber;

            $fileName = $billFile->getClientOriginalName();

            // Upload PDF to WhatsApp servers and get media_id
            $mediaId = $this->uploadMedia($billFile);

            // Send the message with the media_id
            return $this->sendMessage($phoneNumber, $mediaId, $fileName);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }

    private function uploadMedia($file)
    {
        $client = new Client();

        $response = $client->post("https://graph.facebook.com/v17.0/{$this->phoneNumberId}/media", [
            'headers' => [
                'Authorization' => "Bearer {$this->accessToken}",
            ],
            'multipart' => [
                [
                    'name'     => 'file',
                    'contents' => fopen($file->getPathname(), 'r'),
                    'filename' => $file->getClientOriginalName(),
                ],
                [
                    'name'     => 'messaging_product',
                    'contents' => 'whatsapp',
                ],
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        if (!isset($data['id'])) {
            throw new \Exception('Failed to upload media to WhatsApp.');
        }

        return $data['id'];
    }

    private function sendMessage($phoneNumber, $mediaId, $fileName)
    {
        $client = new Client();

        $response = $client->post("https://graph.facebook.com/v17.0/{$this->phoneNumberId}/messages", [
            'headers' => [
                'Authorization' => "Bearer {$this->accessToken}",
                'Content-Type'  => 'application/json',
            ],
            'json' => [
                'messaging_product' => 'whatsapp',
                'to' => $phoneNumber,
                'type' => 'document',
                'document' => [
                    'id' => $mediaId,
                    'caption' => 'Your bill is attached. Get well soon!',
                    'filename' => $fileName,
                ]
            ],
        ]);

        $data = json_decode($response->getBody(), true);

        if (isset($data['messages'])) {
            return response()->json(['success' => 'Message sent successfully', 'data' => $data]);
        } else {
            return response()->json(['error' => 'Failed to send message', 'details' => $data], 500);
        }
    }
}
