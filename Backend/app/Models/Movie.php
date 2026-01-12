<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Orchid\Filters\Filterable;
use Orchid\Filters\Types\Like;
use Orchid\Filters\Types\Where;
use Orchid\Filters\Types\WhereDateStartEnd;
use App\Orchid\Filters\Types\WhereGreaterThanOrEqual;
use Orchid\Screen\AsSource;
use App\Models\User;
use Orchid\Attachment\Models\Attachment;

class Movie extends Model
{
    use HasFactory, AsSource, Filterable;

    protected $fillable = [
        'type',
        'title',
        'description',
        'image',
        'video',
        'genre_id',
        'age_rating',
        'language',
        'is_subtitles',
        'is_dubbed',
        'status',
        'user_id',
        'like',
    ];

    public function genre()
    {
        return $this->belongsTo(Genre::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the seasons for the series.
     */
    public function seasons()
    {
        return $this->hasMany(Season::class);
    }

    /**
     * Scope a query to only include active series.
     *
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSeries($query)
    {
        return $query->where('type', 2)->where('status', 1);
    }

    /**
     * Genre names accessor.
     *
     * @return array<int, string>
     */
    public function getGenreNamesAttribute(): array
    {
        if (blank($this->genre_id)) {
            return [];
        }

        $ids = collect(explode(',', (string) $this->genre_id))
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->unique()
            ->values();

        if ($ids->isEmpty()) {
            return [];
        }

        return Genre::whereIn('id', $ids)->pluck('name')->all();
    }

    /**
     * Get image URL from attachment.
     *
     * @return string
     */
    public function getImageUrlAttribute(): string
    {
        if (!$this->image) {
            return 'https://picsum.photos/200/300?random=' . $this->id;
        }

        $attachment = Attachment::find($this->image);
        if ($attachment) {
            $imageUrl = $attachment->url();

            // If url() returns empty or invalid, try to use path directly (for external URLs)
            if (!$imageUrl || strpos($imageUrl, '  http') !== 0) {
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
        return 'https://picsum.photos/200/300?random=' . $this->id;
    }

    /**
     * Get genre text (comma-separated).
     *
     * @return string
     */
    public function getGenreTextAttribute(): string
    {
        $genreNames = $this->genre_names ?? [];
        return !empty($genreNames) ? implode(', ', $genreNames) : 'N/A';
    }

    /**
     * Get type text.
     *
     * @return string
     */
    public function getTypeTextAttribute(): string
    {
        return $this->type == 1 ? 'Film' : ($this->type == 2 ? 'Series' : 'Unknown');
    }

    /**
     * Get video embed URL from various sources.
     * Supports YouTube, Archive.org, and other video embed URLs.
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
        'id'         => Where::class,
        'title'      => Like::class,
        'type'       => Where::class,
        'genre_id'   => Like::class,
        'language'   => Like::class,
        'age_rating' => WhereGreaterThanOrEqual::class,
        'user_id'    => Where::class,
        'status'     => Where::class,
        'updated_at' => WhereDateStartEnd::class,
        'created_at' => WhereDateStartEnd::class,
    ];

    /**
     * Attributes allowed for sorting.
     *
     * @var array<int, string>
     */
    protected $allowedSorts = [
        'id',
        'title',
        'type',
        'genre_id',
        'age_rating',
        'language',
        'user_id',
        'status',
        'created_at',
        'updated_at',
    ];
}
