import { View, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, Dimensions, Platform, Text, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import { useState, useRef, useEffect } from 'react';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import YoutubePlayer from 'react-native-youtube-iframe';
import * as Linking from 'expo-linking';
import { Colors } from '../constants/Colors';
import { extractYouTubeVideoId, getVideoType } from '../utils/videoHelpers';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface PlayVideoProps {
  videoUrl: string;
  visible: boolean;
  onClose: () => void;
  title?: string;
}

export default function PlayVideo({ videoUrl, visible, onClose, title }: PlayVideoProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [youtubeVideoId, setYoutubeVideoId] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string>('');
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [youtubeLoadTimeout, setYoutubeLoadTimeout] = useState(false);
  const [videoType, setVideoType] = useState<'youtube' | 'direct' | 'unknown'>('unknown');
  const [showControls, setShowControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (visible && videoUrl) {
      setLoading(true);
      setError('');
      setYoutubeVideoId(null);
      setYoutubeError('');
      setYoutubeReady(false);
      setYoutubeLoadTimeout(false);
      setShowControls(true);
      setCurrentTime(0);
      setDuration(0);
      
      const type = getVideoType(videoUrl);
      setVideoType(type);

      if (type === 'youtube') {
        const videoId = extractYouTubeVideoId(videoUrl);
        if (videoId) {
          setYoutubeVideoId(videoId);
          setIsPlaying(true);
          setLoading(false);
        } else {
          setError('Invalid YouTube URL');
          setLoading(false);
        }
      } else if (type === 'direct') {
        setLoading(false);
        setIsPlaying(true);
      } else {
        setError('Unsupported video format. Only YouTube URLs and direct video files (.mp4, .m3u8, etc.) are supported.');
        setLoading(false);
      }
    } else if (!visible) {
      setLoading(true);
      setError('');
      setYoutubeVideoId(null);
      setYoutubeError('');
      setYoutubeReady(false);
      setYoutubeLoadTimeout(false);
      setIsPlaying(false);
      setShowControls(true);
      setCurrentTime(0);
      setDuration(0);
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    }
  }, [visible, videoUrl]);

  // Auto-play direct videos when ready
  useEffect(() => {
    if (videoType === 'direct' && isPlaying && videoRef.current && visible && !loading) {
      const playVideo = async () => {
        try {
          await videoRef.current?.playAsync();
        } catch (error) {
          console.error('Error auto-playing video:', error);
        }
      };
      const timer = setTimeout(() => {
        playVideo();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [videoType, isPlaying, visible, loading]);

  useEffect(() => {
    if (videoType !== 'youtube' || !youtubeVideoId || youtubeReady || youtubeError) return;
    const t = setTimeout(() => setYoutubeLoadTimeout(true), 10000);
    return () => clearTimeout(t);
  }, [videoType, youtubeVideoId, youtubeReady, youtubeError]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && visible && !loading && videoType === 'direct') {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
      controlsTimerRef.current = setTimeout(() => {
        hideControls();
      }, 3000);
    }
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [showControls, visible, loading, videoType]);

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowControls(false);
    });
  };

  const showControlsAnimated = () => {
    setShowControls(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const toggleControls = () => {
    if (showControls) {
      hideControls();
    } else {
      showControlsAnimated();
    }
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setCurrentTime(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      if (status.didJustFinish) {
        setIsPlaying(false);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  const handleOpenInBrowser = async () => {
    try {
      const youtubeUrl = `https://www.youtube.com/watch?v=${youtubeVideoId}`;
      const canOpen = await Linking.canOpenURL(youtubeUrl);
      if (canOpen) {
        await Linking.openURL(youtubeUrl);
      } else {
        console.error('Cannot open YouTube URL');
      }
    } catch (error) {
      console.error('Error opening YouTube:', error);
    }
  };

  const renderVideoContent = () => {
    const showYoutubeLoading = videoType === 'youtube' && youtubeVideoId && !youtubeReady && !youtubeError;
    if (loading && videoType !== 'youtube') {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <Text style={styles.loadingText}>Loading video...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={48} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Unable to play this video</Text>
        </View>
      );
    }

    switch (videoType) {
      case 'youtube':
        if (youtubeVideoId) {
          if (youtubeError) {
            return (
              <View style={styles.youtubeErrorContainer}>
                <MaterialIcons name="error-outline" size={48} color={Colors.error} />
                <Text style={styles.errorText}>{youtubeError}</Text>
                <Text style={styles.errorSubtext}>
                  YouTube may require sign-in verification. You can open the video in your browser instead.
                </Text>
                <TouchableOpacity
                  style={styles.openBrowserButton}
                  onPress={handleOpenInBrowser}
                  activeOpacity={0.8}
                >
                  <MaterialIcons name="open-in-browser" size={20} color="#FFFFFF" />
                  <Text style={styles.openBrowserButtonText}>Open in Browser</Text>
                </TouchableOpacity>
              </View>
            );
          }

          return (
            <View style={styles.youtubeContainer}>
              {showYoutubeLoading && (
                <View style={styles.youtubeLoadingOverlay}>
                  <ActivityIndicator size="large" color="#FFFFFF" />
                  <Text style={styles.loadingText}>Loading video...</Text>
                  {youtubeLoadTimeout && (
                    <>
                      <Text style={styles.loadingSubtext}>If the video doesn't load, try opening in browser.</Text>
                      <TouchableOpacity style={styles.openBrowserButton} onPress={handleOpenInBrowser} activeOpacity={0.8}>
                        <MaterialIcons name="open-in-browser" size={20} color="#FFFFFF" />
                        <Text style={styles.openBrowserButtonText}>Open in Browser</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              )}
              <YoutubePlayer
                height={SCREEN_HEIGHT * 0.85}
                width={SCREEN_WIDTH}
                videoId={youtubeVideoId}
                play={isPlaying}
                forceAndroidAutoplay={Platform.OS === 'android'}
                webViewProps={{
                  javaScriptEnabled: true,
                  domStorageEnabled: true,
                  ...(Platform.OS === 'android' && {
                    mixedContentMode: 'always' as const,
                    androidLayerType: 'hardware' as const,
                  }),
                }}
                initialPlayerParams={{
                  autoplay: 1,
                  controls: 1,
                  rel: 0,
                  modestbranding: 1,
                }}
                onReady={() => {
                  setYoutubeReady(true);
                  setIsPlaying(true);
                }}
                onChangeState={(state: string) => {
                  if (state === 'playing') {
                    setIsPlaying(true);
                    setYoutubeError('');
                  } else if (state === 'unstarted') {
                    setIsPlaying(true);
                  } else if (state === 'ended') {
                    setIsPlaying(false);
                  } else if (state === 'error') {
                    setYoutubeError('YouTube player error. Please try opening in browser.');
                    setIsPlaying(false);
                  }
                }}
                onError={(error: string) => {
                  console.error('YouTube player error:', error);
                  setYoutubeError('Unable to play YouTube video. This may require sign-in verification.');
                }}
              />
            </View>
          );
        }
        break;

      case 'direct':
        return (
          <View style={styles.videoWrapper}>
            <Video
              ref={videoRef}
              source={{ uri: videoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.CONTAIN}
              useNativeControls={false}
              onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
              onError={(error) => {
                setError('Failed to play video');
                console.error('Video error:', error);
              }}
            />
            <TouchableOpacity
              style={styles.videoOverlay}
              activeOpacity={1}
              onPress={toggleControls}
            >
              {showControls && (
                <Animated.View style={[styles.controlsOverlay, { opacity: controlsOpacity }]}>
                  <TouchableOpacity
                    style={styles.playPauseButton}
                    onPress={togglePlayPause}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons
                      name={isPlaying ? 'pause' : 'play-arrow'}
                      size={56}
                      color="#FFFFFF"
                    />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View style={styles.errorContainer}>
            <MaterialIcons name="videocam-off" size={48} color={Colors.error} />
            <Text style={styles.errorText}>Unsupported video format</Text>
            <Text style={styles.errorSubtext}>Please check the video URL</Text>
          </View>
        );
    }

    return null;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <StatusBar hidden />
        {(videoType === 'youtube' || showControls) && (
          <Animated.View style={[styles.header, { opacity: videoType === 'youtube' ? 1 : controlsOpacity }]}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            {title && (
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            )}
            <View style={styles.placeholder} />
          </Animated.View>
        )}

        <View style={styles.videoContainer}>
          {renderVideoContent()}
        </View>

        {videoType === 'direct' && showControls && duration > 0 && (
          <Animated.View style={[styles.controlsBar, { opacity: controlsOpacity }]}>
            <View style={styles.progressContainer}>
              <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBackground}>
                  <View
                    style={[
                      styles.progressBarFill,
                      { width: `${(currentTime / duration) * 100}%` },
                    ]}
                  />
                </View>
              </View>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  videoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  videoWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsOverlay: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 10,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    minWidth: 40,
  },
  progressBarContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    position: 'relative',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  youtubeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  youtubeLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  youtubeErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  openBrowserButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  openBrowserButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },
  loadingSubtext: {
    color: '#AAAAAA',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: Colors.error,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
