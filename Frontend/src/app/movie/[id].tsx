import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getMovieDetail, getMoviesSuggest, MovieDetail, TrendingCard, addMovieToList, removeMovieFromList, addMovieToFavorites, removeMovieFromFavorites, checkMovieInList, checkMovieInFavorites, incrementView } from '../../services/movieService';
import { Colors } from '../../constants/Colors';
import { useRouter } from '../../hooks/useRouter';
import PlayVideo from '../../components/PlayVideo';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const POSTER_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function MovieDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showVideo, setShowVideo] = useState(false);
  const [suggestedMovies, setSuggestedMovies] = useState<TrendingCard[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingList, setIsUpdatingList] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      const movieId = parseInt(id);
      // Reset states when ID changes
      setIsInList(false);
      setIsFavorite(false);
      loadMovieDetail(movieId);
      loadSuggestedMovies(movieId);
      checkListStatus(movieId);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        const movieId = parseInt(id);
        checkListStatus(movieId);
      }
    }, [id])
  );

  const loadMovieDetail = async (movieId: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await getMovieDetail(movieId);
      if (response.success) {
        setMovie(response.data);
      } else {
        setError(response.message || 'Failed to load movie details');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
      console.error('Error loading movie detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSuggestedMovies = async (movieId: number) => {
    setLoadingSuggestions(true);
    try {
      const response = await getMoviesSuggest(movieId);
      if (response.success) {
        setSuggestedMovies(response.data);
      }
    } catch (error) {
      console.error('Error loading suggested movies:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const checkListStatus = async (movieId: number) => {
    try {
      // Check if movie is in user's list using checkList API
      const listResponse = await checkMovieInList(movieId);
      if (listResponse.success && listResponse.data !== undefined) {
        setIsInList(listResponse.data === 1);
      }

      // Check if movie is in user's favorites using checkFav API
      const favResponse = await checkMovieInFavorites(movieId);
      if (favResponse.success && favResponse.data !== undefined) {
        setIsFavorite(favResponse.data === 1);
      }
    } catch (error) {
      console.error('Error checking list/favorite status:', error);
      // Don't set error state, just log it
    }
  };

  const handleAddToList = async () => {
    if (!movie || !id || isUpdatingList) return;
    
    const movieId = parseInt(id);
    if (isNaN(movieId)) {
      Alert.alert('Error', 'Invalid movie ID');
      return;
    }

    setIsUpdatingList(true);
    try {
      if (isInList) {
        const response = await removeMovieFromList(movieId);
        if (response.success) {
          setIsInList(false);
        } else {
          Alert.alert('Error', response.message || 'Failed to remove movie from list');
        }
      } else {
        const response = await addMovieToList(movieId);
        if (response.success) {
          setIsInList(true);
        } else {
          // Don't show error for "already in list" - just update state
          if (response.message?.includes('already')) {
            setIsInList(true);
          } else {
            Alert.alert('Error', response.message || 'Failed to add movie to list');
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Error updating list:', error);
    } finally {
      setIsUpdatingList(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!movie || !id || isUpdatingFavorite) return;
    
    const movieId = parseInt(id);
    if (isNaN(movieId)) {
      Alert.alert('Error', 'Invalid movie ID');
      return;
    }

    setIsUpdatingFavorite(true);
    try {
      if (isFavorite) {
        const response = await removeMovieFromFavorites(movieId);
        if (response.success) {
          setIsFavorite(false);
        } else {
          Alert.alert('Error', response.message || 'Failed to remove movie from favorites');
        }
      } else {
        const response = await addMovieToFavorites(movieId);
        if (response.success) {
          setIsFavorite(true);
        } else {
          // Don't show error for "already in favorites" - just update state
          if (response.message?.includes('already')) {
            setIsFavorite(true);
          } else {
            Alert.alert('Error', response.message || 'Failed to add movie to favorites');
          }
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Error updating favorites:', error);
    } finally {
      setIsUpdatingFavorite(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </View>
    );
  }

  if (error || !movie) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Movie not found'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>{movie.title}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.posterContainer}>
        <Image
          source={{ uri: movie.image }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.gradientOverlay} />
        <View style={styles.playButtonContainer}>
          {movie.video && (
            <TouchableOpacity 
              style={styles.playButton} 
              activeOpacity={0.8}
              onPress={async () => {
                if (id) await incrementView(parseInt(id));
                setShowVideo(true);
              }}
            >
              <MaterialIcons name="play-arrow" size={20} color="#FFFFFF" />
              <Text style={styles.playButtonText}>Play</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.iconButton} 
            activeOpacity={0.8}
            onPress={handleAddToList}
            disabled={isUpdatingList}
          >
            {isUpdatingList ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons 
                name={isInList ? "check" : "add"} 
                size={24} 
                color="#FFFFFF" 
              />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.iconButton} 
            activeOpacity={0.8}
            onPress={handleToggleFavorite}
            disabled={isUpdatingFavorite}
          >
            {isUpdatingFavorite ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <MaterialIcons 
                name={isFavorite ? "favorite" : "favorite-border"} 
                size={24} 
                color={isFavorite ? Colors.primary : "#FFFFFF"} 
              />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{movie.title}</Text>

        <View style={styles.metaContainer}>
          {movie.genre.length > 0 && (
            <View style={styles.genreContainer}>
              {movie.genre.map((genre, index) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.infoRow}>
            {movie.age_rating > 0 && (
              <View style={styles.infoTag}>
                <Text style={styles.infoText}>Age {movie.age_rating}+</Text>
              </View>
            )}
            {movie.lang && (
              <View style={styles.infoTag}>
                <Text style={styles.infoText}>{movie.lang.toUpperCase()}</Text>
              </View>
            )}
            {movie.is_sub === 1 && (
              <View style={styles.infoTag}>
                <Text style={styles.infoText}>Sub</Text>
              </View>
            )}
            {movie.is_dub === 1 && (
              <View style={styles.infoTag}>
                <Text style={styles.infoText}>Dub</Text>
              </View>
            )}
          </View>
        </View>

        {movie.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.description}>{movie.description}</Text>
          </View>
        )}

        {suggestedMovies.length > 0 && (
          <View style={styles.suggestedContainer}>
            <Text style={styles.suggestedTitle}>You May Also Like</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestedScroll}
            >
              {suggestedMovies.map((suggestedMovie) => (
                <TouchableOpacity
                  key={suggestedMovie.id}
                  style={styles.suggestedPoster}
                  onPress={() => router.push(`/movie/${suggestedMovie.id}` as any)}
                  activeOpacity={0.8}
                >
                  <Image
                    source={{ uri: suggestedMovie.image }}
                    style={styles.suggestedImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      </ScrollView>
      <PlayVideo
        videoUrl={movie.video}
        visible={showVideo}
        onClose={() => setShowVideo(false)}
        title={movie.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#1a1a1a',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#000000',
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    textAlign: 'center',
  },
  posterContainer: {
    width: SCREEN_WIDTH,
    height: POSTER_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  content: {
    padding: 20,
    backgroundColor: '#000000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  metaContainer: {
    marginBottom: 24,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8,
  },
  genreTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoTag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 6,
    minWidth: 100,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  suggestedContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
  suggestedTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  suggestedScroll: {
    paddingRight: 20,
  },
  suggestedPoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  suggestedImage: {
    width: '100%',
    height: '100%',
  },
});
