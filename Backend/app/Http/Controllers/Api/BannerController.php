<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use Illuminate\Http\Request;
use Orchid\Attachment\Models\Attachment;

class BannerController extends Controller
{
    private function jsonResponse($data, $status = 200)
    {
        return response()->json($data, $status);
    }

    public function index(Request $request)
    {
        $query = Banner::where('status', 1)
            ->with('movie');

        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        $banners = $query->orderBy('position')
            ->orderBy('created_at', 'desc')
            ->get();

        $baseUrl = $request->getSchemeAndHttpHost();
        
        $bannerData = $banners->map(function ($banner) use ($baseUrl) {
            $imageUrl = null;
            if ($banner->image) {
                $attachment = Attachment::find($banner->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();
                    
                    // Replace localhost with actual domain
                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            // Extract path from attachment URL
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }
                    
                    // If url() returns invalid or empty, construct from path
                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $path = $attachment->path ?? '';
                        if ($path && strpos($path, 'http') === 0) {
                            $imageUrl = $path;
                        } elseif ($path) {
                            // Construct full URL from attachment path
                            $storagePath = str_replace('public/', '', $attachment->physicalPath() ?? '');
                            if ($storagePath) {
                                $imageUrl = $baseUrl . '/storage/' . $storagePath;
                            } else {
                                $imageUrl = $baseUrl . '/storage/' . $path;
                            }
                        }
                    }
                }
            }

            $movieData = null;
            if ($banner->movie) {
                $movieData = [
                    'id' => $banner->movie->id,
                    'title' => $banner->movie->title,
                    'type' => $banner->movie->type,
                ];
    }

            return [
                'id' => $banner->id,
                'position' => $banner->position,
                'image' => $imageUrl,
                'movie' => $movieData,
                'created_at' => $banner->created_at?->toDateTimeString(),
                'updated_at' => $banner->updated_at?->toDateTimeString(),
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Banners retrieved successfully',
            'data' => $bannerData,
        ], 200);
    }
}
