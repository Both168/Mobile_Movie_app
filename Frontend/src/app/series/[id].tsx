import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform, Modal, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { getSeriesDetail, SeriesDetail, Season, Episode, addMovieToList, removeMovieFromList, addMovieToFavorites, removeMovieFromFavorites, checkMovieInList, checkMovieInFavorites, incrementView } from '../../services/movieService';
import { Colors } from '../../constants/Colors';
import { useRouter } from '../../hooks/useRouter';
import PlayVideo from '../../components/PlayVideo';
import { resolveImageUrl } from '../../utils/apiConfig';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const POSTER_HEIGHT = SCREEN_HEIGHT * 0.5;

export default function SeriesDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [series, setSeries] = useState<SeriesDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isUpdatingList, setIsUpdatingList] = useState(false);
  const [isUpdatingFavorite, setIsUpdatingFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      const seriesId = parseInt(id);
      // Reset states when ID changes
      setIsInList(false);
      setIsFavorite(false);
      loadSeriesDetail(seriesId);
      checkListAndFavoriteStatus(seriesId);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      if (id) {
        const seriesId = parseInt(id);
        checkListAndFavoriteStatus(seriesId);
      }
    }, [id])
  );

  const loadSeriesDetail = async (seriesId: number) => {
    setLoading(true);
    setError('');
    try {
      const response = await getSeriesDetail(seriesId);
      if (response.success) {
        setSeries(response.data);
        setSelectedSeason(null);
      } else {
        setError(response.message || 'Failed to load series details');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
      console.error('Error loading series detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkListAndFavoriteStatus = async (seriesId: number) => {
    try {
      // Check if series is in user's list using checkList API
      const listResponse = await checkMovieInList(seriesId);
      if (listResponse.success && listResponse.data !== undefined) {
        setIsInList(listResponse.data === 1);
      }

      // Check if series is in user's favorites using checkFav API
      const favResponse = await checkMovieInFavorites(seriesId);
      if (favResponse.success && favResponse.data !== undefined) {
        setIsFavorite(favResponse.data === 1);
      }
    } catch (error) {
      console.error('Error checking list/favorite status:', error);
      // Don't set error state, just log it
    }
  };

  const handleSeasonSelect = (season: Season | null) => {
    setSelectedSeason(season);
    setDropdownVisible(false);
  };

  const handlePlayEpisode = async (episode: Episode) => {
    if (!episode.video) return;
    if (id) await incrementView(parseInt(id));
    setCurrentVideoUrl(episode.video);
    setCurrentVideoTitle(episode.title);
    setShowVideo(true);
  };

  const handlePlayFirstEpisode = () => {
    if (series && series.seasons.length > 0) {
      const firstSeason = series.seasons[0];
      if (firstSeason.episodes.length > 0) {
        handlePlayEpisode(firstSeason.episodes[0]);
      }
    }
  };

  const handleAddToList = async () => {
    if (!series || !id || isUpdatingList) return;
    
    const seriesId = parseInt(id);
    if (isNaN(seriesId)) {
      Alert.alert('Error', 'Invalid series ID');
      return;
    }

    setIsUpdatingList(true);
    try {
      if (isInList) {
        const response = await removeMovieFromList(seriesId);
        if (response.success) {
          setIsInList(false);
        } else {
          Alert.alert('Error', response.message || 'Failed to remove series from list');
        }
      } else {
        const response = await addMovieToList(seriesId);
        if (response.success) {
          setIsInList(true);
        } else {
          // Don't show error for "already in list" - just update state
          if (response.message?.includes('already')) {
            setIsInList(true);
          } else {
            Alert.alert('Error', response.message || 'Failed to add series to list');
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
    if (!series || !id || isUpdatingFavorite) return;
    
    const seriesId = parseInt(id);
    if (isNaN(seriesId)) {
      Alert.alert('Error', 'Invalid series ID');
      return;
    }

    setIsUpdatingFavorite(true);
    try {
      if (isFavorite) {
        const response = await removeMovieFromFavorites(seriesId);
        if (response.success) {
          setIsFavorite(false);
        } else {
          Alert.alert('Error', response.message || 'Failed to remove series from favorites');
        }
      } else {
        const response = await addMovieToFavorites(seriesId);
        if (response.success) {
          setIsFavorite(true);
        } else {
          // Don't show error for "already in favorites" - just update state
          if (response.message?.includes('already')) {
            setIsFavorite(true);
          } else {
            Alert.alert('Error', response.message || 'Failed to add series to favorites');
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

  if (error || !series) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || 'Series not found'}</Text>
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
        <Text style={styles.headerTitle} numberOfLines={1}>{series.title}</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>

      <View style={styles.posterContainer}>
        <Image
          source={{ uri: resolveImageUrl(series.image) ?? undefined }}
          style={styles.poster}
          resizeMode="cover"
        />
        <View style={styles.gradientOverlay} />
        <View style={styles.playButtonContainer}>
          {series.seasons.some((s: Season) => s.episodes.length > 0) && (
            <TouchableOpacity 
              style={styles.playButton} 
              activeOpacity={0.8}
              onPress={handlePlayFirstEpisode}
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
        <Text style={styles.title}>{series.title}</Text>

        <View style={styles.metaContainer}>
          {series.genre.length > 0 && (
            <View style={styles.genreContainer}>
              {series.genre.map((genre: string, index: number) => (
                <View key={index} style={styles.genreTag}>
                  <Text style={styles.genreText}>{genre}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.infoRow}>
            {series.age_rating > 0 && (
              <View style={styles.infoTag}>
                <Text style={styles.infoText}>Age {series.age_rating}+</Text>
              </View>
            )}
            {series.lang && (
              <View style={styles.infoTag}>
                <Text style={styles.infoText}>{series.lang.toUpperCase()}</Text>
              </View>
            )}
            {series.is_sub === 1 && (
              <View style={styles.infoTag}>
                <Text style={styles.infoText}>Sub</Text>
              </View>
            )}
            {series.is_dub === 1 && (
              <View style={styles.infoTag}>
                <Text style={styles.infoText}>Dub</Text>
              </View>
            )}
          </View>
        </View>

        {series.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.descriptionLabel}>Description</Text>
            <Text style={styles.description}>{series.description}</Text>
          </View>
        )}

        {series.seasons.length > 0 && (
          <View style={styles.seasonsContainer}>
            {series.seasons.length > 1 && (
              <>
                <Text style={styles.seasonsTitle}>Seasons & Episodes</Text>
                
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => setDropdownVisible(true)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownText}>
                    {selectedSeason ? selectedSeason.title : 'All Seasons'}
                  </Text>
                  <MaterialIcons
                    name={dropdownVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={24}
                    color="#FFFFFF"
                  />
                </TouchableOpacity>
              </>
            )}

            {series.seasons.length > 1 && (
              <Modal
                visible={dropdownVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setDropdownVisible(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setDropdownVisible(false)}
                >
                  <View style={styles.dropdownMenu}>
                    <ScrollView
                      style={styles.dropdownScroll}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                    >
                      <TouchableOpacity
                        style={styles.dropdownItem}
                        onPress={() => handleSeasonSelect(null)}
                      >
                        <Text style={styles.dropdownItemText}>All Seasons</Text>
                        {!selectedSeason && (
                          <MaterialIcons name="check" size={20} color={Colors.primary} />
                        )}
                      </TouchableOpacity>
                      {series.seasons
                        .filter((season: Season) => season.episodes.length > 0)
                        .map((season: Season) => (
                          <TouchableOpacity
                            key={season.id}
                            style={styles.dropdownItem}
                            onPress={() => handleSeasonSelect(season)}
                          >
                            <Text style={styles.dropdownItemText}>{season.title}</Text>
                            {selectedSeason?.id === season.id && (
                              <MaterialIcons name="check" size={20} color={Colors.primary} />
                            )}
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              </Modal>
            )}

            {series.seasons.filter((s: Season) => s.episodes.length > 0).length > 0 && (
              <View style={styles.episodesContainer}>
                {series.seasons.length === 1 ? (
                  series.seasons[0].episodes.map((episode: Episode) => (
                    <TouchableOpacity
                      key={episode.id}
                      style={styles.episodeCard}
                      onPress={() => handlePlayEpisode(episode)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.episodeTopRow}>
                        <View style={styles.episodeImageContainer}>
                          <Image
                            source={{ uri: resolveImageUrl(episode.image) ?? undefined }}
                            style={styles.episodeImage}
                            resizeMode="cover"
                          />
                          <View style={styles.playIconContainer}>
                            <MaterialIcons name="play-circle-filled" size={40} color="rgba(0, 0, 0, 0.7)" />
                          </View>
                        </View>
                        <View style={styles.episodeInfo}>
                          <Text style={styles.episodeTitle} numberOfLines={2}>
                            {episode.title}
                          </Text>
                          {episode.duration !== undefined && episode.duration !== null && Number(episode.duration) > 0 && (
                            <Text style={styles.episodeDuration}>
                              {Number(episode.duration)}m
                            </Text>
                          )}
                        </View>
                      </View>
                      {episode.description && (
                        <Text style={styles.episodeDescription}>
                          {episode.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))
                ) : selectedSeason ? (
                  selectedSeason.episodes.map((episode: Episode) => (
                    <TouchableOpacity
                      key={episode.id}
                      style={styles.episodeCard}
                      onPress={() => handlePlayEpisode(episode)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.episodeTopRow}>
                        <View style={styles.episodeImageContainer}>
                          <Image
                            source={{ uri: resolveImageUrl(episode.image) ?? undefined }}
                            style={styles.episodeImage}
                            resizeMode="cover"
                          />
                          <View style={styles.playIconContainer}>
                            <MaterialIcons name="play-circle-filled" size={40} color="rgba(0, 0, 0, 0.7)" />
                          </View>
                        </View>
                        <View style={styles.episodeInfo}>
                          <Text style={styles.episodeTitle} numberOfLines={2}>
                            {episode.title}
                          </Text>
                          {episode.duration !== undefined && episode.duration !== null && Number(episode.duration) > 0 && (
                            <Text style={styles.episodeDuration}>
                              {Number(episode.duration)}m
                            </Text>
                          )}
                        </View>
                      </View>
                      {episode.description && (
                        <Text style={styles.episodeDescription}>
                          {episode.description}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  series.seasons
                    .filter((season: Season) => season.episodes.length > 0)
                    .map((season: Season) => (
                      <View key={season.id} style={styles.seasonSection}>
                        <Text style={styles.seasonSectionTitle}>{season.title}</Text>
                        {season.episodes.map((episode: Episode) => (
                          <TouchableOpacity
                            key={episode.id}
                            style={styles.episodeCard}
                            onPress={() => handlePlayEpisode(episode)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.episodeTopRow}>
                              <View style={styles.episodeImageContainer}>
                                <Image
                                  source={{ uri: resolveImageUrl(episode.image) ?? undefined }}
                                  style={styles.episodeImage}
                                  resizeMode="cover"
                                />
                                <View style={styles.playIconContainer}>
                                  <MaterialIcons name="play-circle-filled" size={40} color="rgba(0, 0, 0, 0.7)" />
                                </View>
                              </View>
                              <View style={styles.episodeInfo}>
                                <Text style={styles.episodeTitle} numberOfLines={2}>
                                  {episode.title}
                                </Text>
                                {typeof episode.duration === 'number' && episode.duration > 0 && (
                                  <Text style={styles.episodeDuration}>
                                    {episode.duration}m
                                  </Text>
                                )}
                              </View>
                            </View>
                            {episode.description && (
                              <Text style={styles.episodeDescription}>
                                {episode.description}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))
                )}
              </View>
            )}
          </View>
        )}
      </View>

      </ScrollView>
      <PlayVideo
        videoUrl={currentVideoUrl}
        visible={showVideo}
        onClose={() => {
          setShowVideo(false);
          setCurrentVideoUrl('');
          setCurrentVideoTitle('');
        }}
        title={currentVideoTitle}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  playButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 20,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    gap: 8,
    minWidth: 100,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
    }),
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
  seasonsContainer: {
    marginTop: 32,
    marginBottom: 20,
  },
  seasonsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    marginBottom: 20,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 100 : 70,
    paddingHorizontal: 20,
  },
  dropdownMenu: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    overflow: 'hidden',
    maxHeight: 300,
    width: '100%',
  },
  dropdownScroll: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  episodesContainer: {
    marginTop: 16,
  },
  episodeCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 12,
  },
  episodeTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  episodeImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  episodeImage: {
    width: 120,
    height: 60,
    borderRadius: 6,
  },
  episodeInfo: {
    flex: 1,
    paddingTop: 4,
  },
  episodeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  episodeDuration: {
    fontSize: 11,
    color: '#999999',
    marginTop: 2,
  },
  episodeDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginTop: 8,
  },
  playIconContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seasonSection: {
    marginBottom: 24,
  },
  seasonSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});
