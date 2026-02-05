<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Movie;
use App\Models\Genre;
use App\Models\UserMovieList;
use App\Models\UserMovieLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Orchid\Attachment\Models\Attachment;
use Carbon\Carbon;

class MovieController extends Controller
{
    private function jsonResponse($data, $status = 200)
    {
        return response()->json($data, $status);
    }

    public function listCardsTrending(Request $request)
    {
        $oneMonthAgo = Carbon::now()->subMonth();
        $baseUrl = $request->getSchemeAndHttpHost();

        $query = Movie::where('status', 1)
            ->where('updated_at', '>=', $oneMonthAgo);

        $count = $query->count();

        if ($count === 0) {
            $movies = Movie::where('status', 1)
                ->orderBy('view', 'desc')
                ->orderBy('updated_at', 'desc')
                ->limit(20)
                ->get();
        } else {
            $movies = $query
                ->orderBy('view', 'desc')
                ->orderBy('updated_at', 'desc')
                ->limit(20)
                ->get();
        }

        $movieData = $movies->map(function ($movie) use ($baseUrl) {
            $imageUrl = null;
            if ($movie->image) {
                $attachment = Attachment::find($movie->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();

                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }

                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $physicalPath = $attachment->physicalPath();
                        if ($physicalPath) {
                            $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                        }
                    }
                }
            }

            $genreNames = [];
            if ($movie->genre_id) {
                $genreIds = collect(explode(',', (string) $movie->genre_id))
                    ->filter()
                    ->map(fn ($id) => (int) trim($id))
                    ->unique()
                    ->values();
                if ($genreIds->isNotEmpty()) {
                    $genreNames = Genre::whereIn('id', $genreIds)->pluck('name')->toArray();
                }
            }

            return [
                'id' => $movie->id,
                'title' => $movie->title ?? '',
                'description' => $movie->description ?? '',
                'image' => $imageUrl,
                'genre' => $genreNames,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Trending movies retrieved successfully',
            'data' => $movieData,
        ], 200);
    }

    public function myList(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $baseUrl = $request->getSchemeAndHttpHost();

        $movies = $user->movies()
            ->where('status', 1)
            ->orderBy('created_at', 'desc')
            ->get();

        $movieData = $movies->map(function ($movie) use ($baseUrl) {
            $imageUrl = null;
            if ($movie->image) {
                $attachment = Attachment::find($movie->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();

                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }

                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $physicalPath = $attachment->physicalPath();
                        if ($physicalPath) {
                            $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                        }
                    }
                }
            }

            return [
                'id' => $movie->id,
                'image' => $imageUrl,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'User movie list retrieved successfully',
            'data' => $movieData,
        ], 200);
    }

    public function dramaListCard(Request $request)
    {
        $baseUrl = $request->getSchemeAndHttpHost();

        $movies = Movie::where('status', 1)
            ->where(function ($query) {
                $query->where('genre_id', '12')
                    ->orWhere('genre_id', 'like', '12,%')
                    ->orWhere('genre_id', 'like', '%,12,%')
                    ->orWhere('genre_id', 'like', '%,12');
            })
            ->orderBy('view', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        $movieData = $movies->map(function ($movie) use ($baseUrl) {
            $imageUrl = null;
            if ($movie->image) {
                $attachment = Attachment::find($movie->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();

                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }

                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $physicalPath = $attachment->physicalPath();
                        if ($physicalPath) {
                            $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                        }
                    }
                }
            }

            return [
                'id' => $movie->id,
                'image' => $imageUrl,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Drama movies retrieved successfully',
            'data' => $movieData,
        ], 200);
    }

    public function seriesCards(Request $request)
    {
        $baseUrl = $request->getSchemeAndHttpHost();
        $page = $request->input('page', 1);
        $perPage = 20;
        $genreId = $request->input('genre_id');

        $query = Movie::where('status', 1)
            ->where('type', 2);

        if ($genreId) {
            $query->where(function ($q) use ($genreId) {
                $q->where('genre_id', $genreId)
                    ->orWhere('genre_id', 'like', $genreId . ',%')
                    ->orWhere('genre_id', 'like', '%,' . $genreId . ',%')
                    ->orWhere('genre_id', 'like', '%,' . $genreId);
            });
        }

        $movies = $query->orderBy('view', 'desc')
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $movieData = $movies->map(function ($movie) use ($baseUrl) {
            $imageUrl = null;
            if ($movie->image) {
                $attachment = Attachment::find($movie->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();

                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }

                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $physicalPath = $attachment->physicalPath();
                        if ($physicalPath) {
                            $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                        }
                    }
                }
            }

            return [
                'id' => $movie->id,
                'image' => $imageUrl,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Series retrieved successfully',
            'data' => $movieData,
            'pagination' => [
                'current_page' => $movies->currentPage(),
                'per_page' => $movies->perPage(),
                'total' => $movies->total(),
                'last_page' => $movies->lastPage(),
                'from' => $movies->firstItem(),
                'to' => $movies->lastItem(),
            ],
        ], 200);
    }

    public function seriesGenere(Request $request)
    {
        $genres = Genre::orderBy('name', 'asc')->get();

        $genreData = $genres->map(function ($genre) {
            return [
                'id' => $genre->id,
                'name' => $genre->name,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Genres retrieved successfully',
            'data' => $genreData,
        ], 200);
    }

    public function moviesCards(Request $request)
    {
        $baseUrl = $request->getSchemeAndHttpHost();
        $page = $request->input('page', 1);
        $perPage = 20;
        $genreId = $request->input('genre_id');

        $query = Movie::where('status', 1)
            ->where('type', 1);

        if ($genreId) {
            $query->where(function ($q) use ($genreId) {
                $q->where('genre_id', $genreId)
                    ->orWhere('genre_id', 'like', $genreId . ',%')
                    ->orWhere('genre_id', 'like', '%,' . $genreId . ',%')
                    ->orWhere('genre_id', 'like', '%,' . $genreId);
            });
        }

        $movies = $query->orderBy('view', 'desc')
            ->orderBy('updated_at', 'desc')
            ->paginate($perPage, ['*'], 'page', $page);

        $movieData = $movies->map(function ($movie) use ($baseUrl) {
            $imageUrl = null;
            if ($movie->image) {
                $attachment = Attachment::find($movie->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();

                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }

                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $physicalPath = $attachment->physicalPath();
                        if ($physicalPath) {
                            $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                        }
                    }
                }
            }

            return [
                'id' => $movie->id,
                'image' => $imageUrl,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Movies retrieved successfully',
            'data' => $movieData,
            'pagination' => [
                'current_page' => $movies->currentPage(),
                'per_page' => $movies->perPage(),
                'total' => $movies->total(),
                'last_page' => $movies->lastPage(),
                'from' => $movies->firstItem(),
                'to' => $movies->lastItem(),
            ],
        ], 200);
    }

    public function moviesGenre(Request $request)
    {
        $genres = Genre::orderBy('name', 'asc')->get();

        $genreData = $genres->map(function ($genre) {
            return [
                'id' => $genre->id,
                'name' => $genre->name,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Genres retrieved successfully',
            'data' => $genreData,
        ], 200);
    }

    private function performSearch(Request $request, $type = null)
    {
        $baseUrl = $request->getSchemeAndHttpHost();
        $page = $request->input('page', 1);
        $perPage = 20;
        $search = $request->input('title', $request->input('q', ''));

        $query = Movie::where('status', 1);

        if ($type !== null) {
            $query->where('type', $type);
        }

        if ($search) {
            $query->where('title', 'like', '%' . $search . '%');
        }

        $movies = $query->orderBy('view', 'desc')
            ->orderBy('updated_at', 'desc')
            ->get();

        if ($search) {
            $searchLength = mb_strlen($search);
            $movies = $movies->filter(function ($movie) use ($searchLength) {
                $titleLength = mb_strlen($movie->title);
                $ratio = ($searchLength / $titleLength) * 100;
                return $ratio >= 40;
            });
        }

        $total = $movies->count();
        $movies = $movies->slice(($page - 1) * $perPage, $perPage)->values();

        $movieData = $movies->map(function ($movie) use ($baseUrl) {
            $imageUrl = null;
            if ($movie->image) {
                $attachment = Attachment::find($movie->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();

                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }

                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $physicalPath = $attachment->physicalPath();
                        if ($physicalPath) {
                            $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                        }
                    }
                }
            }

            return [
                'id' => $movie->id,
                'image' => $imageUrl,
            ];
        });

        $lastPage = (int)ceil($total / $perPage);
        $from = $total > 0 ? (($page - 1) * $perPage) + 1 : null;
        $to = $total > 0 ? min($page * $perPage, $total) : null;

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Search results retrieved successfully',
            'data' => $movieData,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $perPage,
                'total' => $total,
                'last_page' => $lastPage,
                'from' => $from,
                'to' => $to,
            ],
        ], 200);
    }

    public function searchAll(Request $request)
    {
        return $this->performSearch($request, null);
    }

    public function searchSeries(Request $request)
    {
        return $this->performSearch($request, 2);
    }

    public function searchMovies(Request $request)
    {
        return $this->performSearch($request, 1);
    }

    public function incrementView(Request $request)
    {
        $id = $request->input('id');
        if (!$id) {
            return $this->jsonResponse(['success' => false, 'message' => 'ID is required'], 400);
        }
        $movie = Movie::where('id', $id)->where('status', 1)->first();
        if (!$movie) {
            return $this->jsonResponse(['success' => false, 'message' => 'Not found'], 404);
        }
        Movie::where('id', $id)->update(['view' => DB::raw('COALESCE(view, 0) + 1')]);
        $movie->refresh();
        return $this->jsonResponse(['success' => true, 'message' => 'View incremented', 'data' => ['view' => (int) $movie->view]], 200);
    }

    public function moviesDetail(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Movie ID is required',
            ], 400);
        }

        $movie = Movie::where('id', $id)
            ->where('type', 1)
            ->where('status', 1)
            ->first();

        if (!$movie) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Movie not found',
            ], 404);
        }

        $baseUrl = $request->getSchemeAndHttpHost();

        // Get image URL
        $imageUrl = null;
        if ($movie->image) {
            $attachment = Attachment::find($movie->image);
            if ($attachment) {
                $attachmentUrl = $attachment->url();

                if ($attachmentUrl) {
                    if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                        $path = parse_url($attachmentUrl, PHP_URL_PATH);
                        $imageUrl = $baseUrl . $path;
                    } else {
                        $imageUrl = $attachmentUrl;
                    }
                }

                if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                    $physicalPath = $attachment->physicalPath();
                    if ($physicalPath) {
                        $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                    }
                }
            }
        }

        // Get genre names
        $genreNames = [];
        if ($movie->genre_id) {
            $genreIds = collect(explode(',', (string) $movie->genre_id))
                ->filter()
                ->map(fn ($id) => (int) trim($id))
                ->unique()
                ->values();

            if ($genreIds->isNotEmpty()) {
                $genreNames = Genre::whereIn('id', $genreIds)
                    ->pluck('name')
                    ->toArray();
            }
        }

        // Get video URL (use embed URL if available, otherwise use raw video field)
        $videoUrl = $movie->video;
        if ($movie->video_embed_url) {
            $videoUrl = $movie->video_embed_url;
        }

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Movie details retrieved successfully',
            'data' => [
                'title' => $movie->title,
                'description' => $movie->description,
                'image' => $imageUrl,
                'video' => $videoUrl,
                'genre' => $genreNames,
                'age_rating' => $movie->age_rating,
                'lang' => $movie->language,
                'is_sub' => $movie->is_subtitles,
                'is_dub' => $movie->is_dubbed,
            ],
        ], 200);
    }

    public function moviesSuggest(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Movie ID is required',
            ], 400);
        }

        $movie = Movie::where('id', $id)
            ->where('type', 1)
            ->where('status', 1)
            ->first();

        if (!$movie) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Movie not found',
            ], 404);
        }

        // Get genre IDs from the movie
        $genreIds = [];
        if ($movie->genre_id) {
            $genreIds = collect(explode(',', (string) $movie->genre_id))
                ->filter()
                ->map(fn ($id) => (int) trim($id))
                ->unique()
                ->values()
                ->toArray();
        }

        if (empty($genreIds)) {
            return $this->jsonResponse([
                'success' => true,
                'message' => 'No suggestions found (movie has no genres)',
                'data' => [],
            ], 200);
        }

        $baseUrl = $request->getSchemeAndHttpHost();

        // Find movies with at least one matching genre, excluding the current movie
        $query = Movie::where('status', 1)
            ->where('type', 1)
            ->where('id', '!=', $id);

        // Build query to match any of the genres
        $query->where(function ($q) use ($genreIds) {
            foreach ($genreIds as $genreId) {
                $q->orWhere(function ($subQ) use ($genreId) {
                    $subQ->where('genre_id', $genreId)
                        ->orWhere('genre_id', 'like', $genreId . ',%')
                        ->orWhere('genre_id', 'like', '%,' . $genreId . ',%')
                        ->orWhere('genre_id', 'like', '%,' . $genreId);
                });
            }
        });

        $movies = $query->orderBy('view', 'desc')
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        $movieData = $movies->map(function ($movie) use ($baseUrl) {
            $imageUrl = null;
            if ($movie->image) {
                $attachment = Attachment::find($movie->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();

                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }

                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $physicalPath = $attachment->physicalPath();
                        if ($physicalPath) {
                            $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                        }
                    }
                }
            }

            return [
                'id' => $movie->id,
                'image' => $imageUrl,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Suggested movies retrieved successfully',
            'data' => $movieData,
        ], 200);
    }

    public function seriesDetail(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Series ID is required',
            ], 400);
        }

        $series = Movie::where('id', $id)
            ->where('type', 2)
            ->where('status', 1)
            ->with(['seasons.episodes' => function ($query) {
                $query->orderBy('id', 'asc');
            }])
            ->first();

        if (!$series) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Series not found',
            ], 404);
        }

        $baseUrl = $request->getSchemeAndHttpHost();

        $imageUrl = null;
        if ($series->image) {
            $attachment = Attachment::find($series->image);
            if ($attachment) {
                $attachmentUrl = $attachment->url();

                if ($attachmentUrl) {
                    if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                        $path = parse_url($attachmentUrl, PHP_URL_PATH);
                        $imageUrl = $baseUrl . $path;
                    } else {
                        $imageUrl = $attachmentUrl;
                    }
                }

                if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                    $physicalPath = $attachment->physicalPath();
                    if ($physicalPath) {
                        $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                    }
                }
            }
        }

        $genreNames = [];
        if ($series->genre_id) {
            $genreIds = collect(explode(',', (string) $series->genre_id))
                ->filter()
                ->map(fn ($id) => (int) trim($id))
                ->unique()
                ->values();

            if ($genreIds->isNotEmpty()) {
                $genreNames = Genre::whereIn('id', $genreIds)
                    ->pluck('name')
                    ->toArray();
            }
        }

        $seasonsData = $series->seasons->sortBy('number_of_season')->map(function ($season) use ($baseUrl) {
            $episodesData = $season->episodes->map(function ($episode) use ($baseUrl) {
                $episodeImageUrl = null;
                if ($episode->image) {
                    $episodeAttachment = Attachment::find($episode->image);
                    if ($episodeAttachment) {
                        $episodeAttachmentUrl = $episodeAttachment->url();

                        if ($episodeAttachmentUrl) {
                            if (strpos($episodeAttachmentUrl, '127.0.0.1') !== false || strpos($episodeAttachmentUrl, 'localhost') !== false) {
                                $path = parse_url($episodeAttachmentUrl, PHP_URL_PATH);
                                $episodeImageUrl = $baseUrl . $path;
                            } else {
                                $episodeImageUrl = $episodeAttachmentUrl;
                            }
                        }

                        if (!$episodeImageUrl || strpos($episodeImageUrl, 'http') !== 0) {
                            $physicalPath = $episodeAttachment->physicalPath();
                            if ($physicalPath) {
                                $episodeImageUrl = $baseUrl . '/storage/' . $physicalPath;
                            }
                        }
                    }
                }

                $episodeVideoUrl = $episode->video;
                if ($episode->video_embed_url) {
                    $episodeVideoUrl = $episode->video_embed_url;
                }

                return [
                    'id' => $episode->id,
                    'title' => $episode->title,
                    'description' => $episode->description,
                    'image' => $episodeImageUrl,
                    'video' => $episodeVideoUrl,
                    'duration' => $episode->duration,
                ];
            })->values();

            return [
                'id' => $season->id,
                'title' => $season->title,
                'description' => $season->description,
                'number_of_season' => $season->number_of_season,
                'episodes' => $episodesData,
            ];
        })->values();

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Series details retrieved successfully',
            'data' => [
                'title' => $series->title,
                'description' => $series->description,
                'image' => $imageUrl,
                'genre' => $genreNames,
                'age_rating' => $series->age_rating,
                'lang' => $series->language,
                'is_sub' => $series->is_subtitles,
                'is_dub' => $series->is_dubbed,
                'seasons' => $seasonsData,
            ],
        ], 200);
    }

    public function seriesSuggest(Request $request)
    {
        $id = $request->input('id');

        if (!$id) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Series ID is required',
            ], 400);
        }

        $series = Movie::where('id', $id)
            ->where('type', 2)
            ->where('status', 1)
            ->first();

        if (!$series) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Series not found',
            ], 404);
        }

        $genreIds = [];
        if ($series->genre_id) {
            $genreIds = collect(explode(',', (string) $series->genre_id))
                ->filter()
                ->map(fn ($id) => (int) trim($id))
                ->unique()
                ->values()
                ->toArray();
        }

        if (empty($genreIds)) {
            return $this->jsonResponse([
                'success' => true,
                'message' => 'No suggestions found (series has no genres)',
                'data' => [],
            ], 200);
        }

        $baseUrl = $request->getSchemeAndHttpHost();

        $query = Movie::where('status', 1)
            ->where('type', 2)
            ->where('id', '!=', $id);

        $query->where(function ($q) use ($genreIds) {
            foreach ($genreIds as $genreId) {
                $q->orWhere(function ($subQ) use ($genreId) {
                    $subQ->where('genre_id', $genreId)
                        ->orWhere('genre_id', 'like', $genreId . ',%')
                        ->orWhere('genre_id', 'like', '%,' . $genreId . ',%')
                        ->orWhere('genre_id', 'like', '%,' . $genreId);
                });
            }
        });

        $seriesList = $query->orderBy('view', 'desc')
            ->orderBy('updated_at', 'desc')
            ->limit(10)
            ->get();

        $seriesData = $seriesList->map(function ($item) use ($baseUrl) {
            $imageUrl = null;
            if ($item->image) {
                $attachment = Attachment::find($item->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();

                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }

                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $physicalPath = $attachment->physicalPath();
                        if ($physicalPath) {
                            $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                        }
                    }
                }
            }

            return [
                'id' => $item->id,
                'image' => $imageUrl,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Suggested series retrieved successfully',
            'data' => $seriesData,
        ], 200);
    }

    public function addMovieList(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $request->validate([
            'movie_id' => 'required|integer|exists:movies,id',
        ]);

        $movieId = $request->input('movie_id');

        $exists = UserMovieList::where('user_web_id', $user->id)
            ->where('movie_id', $movieId)
            ->exists();

        if ($exists) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Movie already in your list',
            ], 400);
        }

        UserMovieList::create([
            'user_web_id' => $user->id,
            'movie_id' => $movieId,
        ]);

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Movie added to list successfully',
        ], 200);
    }

    public function removeMovieList(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $request->validate([
            'movie_id' => 'required|integer|exists:movies,id',
        ]);

        $movieId = $request->input('movie_id');

        $deleted = UserMovieList::where('user_web_id', $user->id)
            ->where('movie_id', $movieId)
            ->delete();

        if (!$deleted) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Movie not found in your list',
            ], 404);
        }

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Movie removed from list successfully',
        ], 200);
    }

    public function addMovieFav(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $request->validate([
            'movie_id' => 'required|integer|exists:movies,id',
        ]);

        $movieId = $request->input('movie_id');

        $exists = UserMovieLike::where('user_web_id', $user->id)
            ->where('movie_id', $movieId)
            ->exists();

        if ($exists) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Movie already in your favorites',
            ], 400);
        }

        UserMovieLike::create([
            'user_web_id' => $user->id,
            'movie_id' => $movieId,
        ]);

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Movie added to favorites successfully',
        ], 200);
    }

    public function removeMovieFav(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $request->validate([
            'movie_id' => 'required|integer|exists:movies,id',
        ]);

        $movieId = $request->input('movie_id');

        $deleted = UserMovieLike::where('user_web_id', $user->id)
            ->where('movie_id', $movieId)
            ->delete();

        if (!$deleted) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Movie not found in your favorites',
            ], 404);
        }

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Movie removed from favorites successfully',
        ], 200);
    }

    public function mayLike(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $baseUrl = $request->getSchemeAndHttpHost();

        $favoriteMovies = UserMovieLike::where('user_web_id', $user->id)
            ->with('movie')
            ->get()
            ->pluck('movie')
            ->filter();

        if ($favoriteMovies->isEmpty()) {
            return $this->jsonResponse([
                'success' => true,
                'message' => 'No recommendations available',
                'data' => [],
            ], 200);
        }

        $favoriteMovieIds = $favoriteMovies->pluck('id')->toArray();

        $genreIds = collect();
        foreach ($favoriteMovies as $movie) {
            if ($movie->genre_id) {
                $ids = collect(explode(',', (string) $movie->genre_id))
                    ->filter()
                    ->map(fn ($id) => (int) trim($id))
                    ->unique();
                $genreIds = $genreIds->merge($ids);
            }
        }

        $genreIds = $genreIds->unique()->values()->toArray();

        if (empty($genreIds)) {
            return $this->jsonResponse([
                'success' => true,
                'message' => 'No recommendations available',
                'data' => [],
            ], 200);
        }

        $recommendedMovies = Movie::where('status', 1)
            ->whereNotIn('id', $favoriteMovieIds)
            ->where(function ($query) use ($genreIds) {
                foreach ($genreIds as $genreId) {
                    $query->orWhere('genre_id', 'like', '%' . $genreId . '%');
                }
            })
            ->limit(20)
            ->get();

        $movieData = $recommendedMovies->map(function ($movie) use ($baseUrl) {
            $imageUrl = null;
            if ($movie->image) {
                $attachment = Attachment::find($movie->image);
                if ($attachment) {
                    $attachmentUrl = $attachment->url();

                    if ($attachmentUrl) {
                        if (strpos($attachmentUrl, '127.0.0.1') !== false || strpos($attachmentUrl, 'localhost') !== false) {
                            $path = parse_url($attachmentUrl, PHP_URL_PATH);
                            $imageUrl = $baseUrl . $path;
                        } else {
                            $imageUrl = $attachmentUrl;
                        }
                    }

                    if (!$imageUrl || strpos($imageUrl, 'http') !== 0) {
                        $physicalPath = $attachment->physicalPath();
                        if ($physicalPath) {
                            $imageUrl = $baseUrl . '/storage/' . $physicalPath;
                        }
                    }
                }
            }

            return [
                'id' => $movie->id,
                'image' => $imageUrl,
            ];
        });

        return $this->jsonResponse([
            'success' => true,
            'message' => 'Recommendations retrieved successfully',
            'data' => $movieData,
        ], 200);
    }

    public function checkList(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $request->validate([
            'movie_id' => 'required|integer|exists:movies,id',
        ]);

        $movieId = $request->input('movie_id');

        $exists = UserMovieList::where('user_web_id', $user->id)
            ->where('movie_id', $movieId)
            ->exists();

        return $this->jsonResponse([
            'success' => true,
            'data' => $exists ? 1 : 0,
        ], 200);
    }

    public function checkFav(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return $this->jsonResponse([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $request->validate([
            'movie_id' => 'required|integer|exists:movies,id',
        ]);

        $movieId = $request->input('movie_id');

        $exists = UserMovieLike::where('user_web_id', $user->id)
            ->where('movie_id', $movieId)
            ->exists();

        return $this->jsonResponse([
            'success' => true,
            'data' => $exists ? 1 : 0,
        ], 200);
    }
}
