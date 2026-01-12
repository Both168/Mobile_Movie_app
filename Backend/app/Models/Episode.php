<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Orchid\Screen\AsSource;
use Orchid\Filters\Filterable;
use Orchid\Filters\Types\Like;
use Orchid\Filters\Types\Where;
use Orchid\Filters\Types\WhereDateStartEnd;
use Orchid\Attachment\Models\Attachment;

class Episode extends Model
{
    use HasFactory, AsSource, Filterable;

    protected $table = 'episode';

    protected $fillable = [
        'titile',
        'description',
        'season_id',
        'video',
        'image',
        'duration',
    ];

    /**
     * Get the season that owns the episode.
     */
    public function season()
    {
        return $this->belongsTo(Season::class);
    }

    /**
     * Title accessor - maps titile to title for easier use.
     */
    public function getTitleAttribute()
    {
        return $this->attributes['titile'] ?? null;
    }

    /**
     * Title mutator - maps title to titile for database.
     */
    public function setTitleAttribute($value)
    {
        $this->attributes['titile'] = $value;
    }

    /**
     * Disable timestamps since table doesn't have created_at/updated_at columns.
     */
    public $timestamps = false;

    /**
     * Get image URL from attachment.
     *
     * @return string
     */
    public function getImageUrlAttribute(): string
    {
        if (!$this->image) {
            return 'https://picsum.photos/400/225?random=' . $this->id;
        }

        // Convert image ID to integer if it's a string
        $imageId = is_numeric($this->image) ? (int) $this->image : $this->image;
        
        $attachment = Attachment::find($imageId);
        if ($attachment) {
            $imageUrl = $attachment->url();

            // If url() returns empty or invalid, try to use path directly (for external URLs)
            if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                $path = $attachment->path ?? '';
                if (strpos($path, 'http') === 0) {
                    return $path; // Use external URL directly
                }
            }

            if ($imageUrl) {
                return $imageUrl;
            }
        }

        // Fallback image
        return 'https://picsum.photos/400/225?random=' . $this->id;
    }

    /**
     * Get the video embed URL attribute.
     * Handles various video formats: YouTube, Archive.org, iframe HTML, etc.
     *
     * @return string|null
     */
    public function getVideoEmbedUrlAttribute(): ?string
    {
        if (!$this->video) {
            return null;
        }

        $video = trim($this->video);

        // If it's already an iframe HTML, extract the src
        if (preg_match('/<iframe[^>]+src=["\']([^"\']+)["\']/', $video, $matches)) {
            $video = html_entity_decode($matches[1], ENT_QUOTES, 'UTF-8');
        }

        // Decode URL entities if needed
        $video = html_entity_decode($video, ENT_QUOTES, 'UTF-8');

        // YouTube: youtube.com/watch?v= or youtu.be/
        if (preg_match('/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/', $video, $matches)) {
            $videoId = $matches[1];
            return "https://www.youtube.com/embed/{$videoId}";
        }

        // YouTube: Already embed URL
        if (strpos($video, 'youtube.com/embed/') !== false || strpos($video, 'youtu.be/embed/') !== false) {
            // Extract just the URL without query parameters if needed
            if (($pos = strpos($video, '?')) !== false) {
                $video = substr($video, 0, $pos);
            }
            return $video;
        }

        // Archive.org: Handle both embed and details URLs
        if (preg_match('/archive\.org\/(?:embed|details)\/([^\/\?\s"\'<>]+)/', $video, $matches)) {
            $archiveId = $matches[1];
            return "https://archive.org/embed/{$archiveId}";
        }

        // If it's already an embed URL (starts with http and contains /embed/)
        if (strpos($video, 'http') === 0 && strpos($video, '/embed/') !== false) {
            return $video;
        }

        // Return as is if it looks like a valid URL
        if (filter_var($video, FILTER_VALIDATE_URL)) {
            return $video;
        }

        return null;
    }

    /**
     * Attributes allowed for filtering.
     *
     * @var array<string, string>
     */
    protected $allowedFilters = [
        'id' => Where::class,
        'titile' => Like::class,
        'season_id' => Where::class,
    ];

    /**
     * Attributes allowed for sorting.
     *
     * @var array<int, string>
     */
    protected $allowedSorts = [
        'id',
        'titile',
        'season_id',
    ];
}

