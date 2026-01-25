import { View, Text, StyleSheet, ScrollView, Image, Dimensions, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { getBanners, Banner } from '../services/bannerService';
import { Colors } from '../constants/Colors';
import { useRouter } from '../hooks/useRouter';
import PlayVideo from './PlayVideo';
import { getMovieDetail, getSeriesDetail, incrementView } from '../services/movieService';
import { ROUTES } from '../utils/routes';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BANNER_HEIGHT = SCREEN_HEIGHT * 0.6;

interface BannerSliderProps {
  position: number;
}

export default function BannerSlider({ position }: BannerSliderProps) {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const autoSlideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string>('');
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string>('');
  const [loadingVideo, setLoadingVideo] = useState(false);

  useEffect(() => {
    loadBanners();
  }, [position]);

  useEffect(() => {
    if (banners.length > 1) {
      autoSlideTimerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % banners.length;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * SCREEN_WIDTH,
            animated: true,
          });
          return nextIndex;
        });
      }, 5000);
    }

    return () => {
      if (autoSlideTimerRef.current) {
        clearInterval(autoSlideTimerRef.current);
      }
    };
  }, [banners.length]);

  const loadBanners = async () => {
    try {
      const response = await getBanners(position);
      if (response.success) {
        setBanners(response.data);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SCREEN_WIDTH);
    setCurrentIndex(index);
    
    if (autoSlideTimerRef.current) {
      clearInterval(autoSlideTimerRef.current);
    }
    
    if (banners.length > 1) {
      autoSlideTimerRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % banners.length;
          scrollViewRef.current?.scrollTo({
            x: nextIndex * SCREEN_WIDTH,
            animated: true,
          });
          return nextIndex;
        });
      }, 5000);
    }
  };

  const handlePlayPress = async (banner: Banner) => {
    if (!banner.movie) return;

    setLoadingVideo(true);
    try {
      const movieResponse = await getMovieDetail(banner.movie.id);
      if (movieResponse.success && movieResponse.data.video) {
        await incrementView(banner.movie.id);
        setCurrentVideoUrl(movieResponse.data.video);
        setCurrentVideoTitle(movieResponse.data.title);
        setShowVideo(true);
        setLoadingVideo(false);
        return;
      }

      const seriesResponse = await getSeriesDetail(banner.movie.id);
      if (seriesResponse.success && seriesResponse.data.seasons.length > 0) {
        const firstSeason = seriesResponse.data.seasons.find((s: any) => s.episodes.length > 0);
        if (firstSeason && firstSeason.episodes.length > 0) {
          await incrementView(banner.movie.id);
          setCurrentVideoUrl(firstSeason.episodes[0].video);
          setCurrentVideoTitle(firstSeason.episodes[0].title);
          setShowVideo(true);
        }
      }
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoadingVideo(false);
    }
  };

  const handleDetailsPress = async (banner: Banner) => {
    if (!banner.movie) return;

    // Try movie first
    try {
      const movieResponse = await getMovieDetail(banner.movie.id);
      if (movieResponse.success) {
        router.push(ROUTES.MOVIE_DETAIL.replace('[id]', banner.movie.id.toString()) as any);
        return;
      }
    } catch (error) {
      // If movie fails, try series
    }

    // Try series
    try {
      const seriesResponse = await getSeriesDetail(banner.movie.id);
      if (seriesResponse.success) {
        router.push(ROUTES.SERIES_DETAIL.replace('[id]', banner.movie.id.toString()) as any);
      }
    } catch (error) {
      console.error('Error determining banner type:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (banners.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No banners available</Text>
      </View>
    );
  }

  return (
    <View style={styles.bannerWrapper}>
      <View style={styles.bannerContainer}>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.bannerSlider}
        >
          {banners.map((banner) => (
            <View key={banner.id} style={styles.bannerItem}>
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              {banner.movie && (
                <View style={styles.bannerContent}>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={styles.playButton} 
                      activeOpacity={0.8}
                      onPress={() => handlePlayPress(banner)}
                      disabled={loadingVideo}
                    >
                      {loadingVideo ? (
                        <ActivityIndicator size="small" color="#000" />
                      ) : (
                        <>
                          <MaterialIcons name="play-arrow" size={18} color="#000" />
                          <Text style={styles.playButtonText}>Play</Text>
                        </>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.detailsButton} 
                      activeOpacity={0.8}
                      onPress={() => handleDetailsPress(banner)}
                    >
                      <MaterialIcons name="info-outline" size={18} color="#FFFFFF" />
                      <Text style={styles.detailsButtonText}>Details</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
        {banners.length > 1 && (
          <View style={styles.pagination}>
            {banners.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        )}
      </View>

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
  bannerWrapper: {
    marginTop: 0,
    marginHorizontal: 0,
  },
  bannerContainer: {
    position: 'relative',
    height: BANNER_HEIGHT,
    overflow: 'hidden',
  },
  bannerSlider: {
    height: BANNER_HEIGHT,
  },
  bannerItem: {
    width: SCREEN_WIDTH,
    height: BANNER_HEIGHT,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerContent: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
  },
  movieTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FF6B35',
    textShadowColor: 'rgba(255, 107, 53, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    marginBottom: 8,
    letterSpacing: 2,
  },
  movieSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 24,
    letterSpacing: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    gap: 6,
    minWidth: 100,
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
  playButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    minWidth: 100,
    gap: 6,
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
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pagination: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  paginationDotActive: {
    backgroundColor: Colors.primary,
    width: 8,
    height: 8,
    borderRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  loadingContainer: {
    height: BANNER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  emptyContainer: {
    height: BANNER_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    marginHorizontal: 16,
    borderRadius: 22,
    backgroundColor: '#2a2a2a',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 5, height: 5 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
});
