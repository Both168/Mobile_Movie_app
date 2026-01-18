import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { TrendingCard } from '../services/movieService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_WIDTH = 120;
const POSTER_HEIGHT = 180;

interface MovieListProps {
  title: string;
  movies: TrendingCard[];
  onMoviePress?: (movie: TrendingCard) => void;
}

export default function MovieList({ title, movies, onMoviePress }: MovieListProps) {
  if (movies.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {movies.map((movie) => (
          <TouchableOpacity
            key={movie.id}
            style={styles.posterContainer}
            onPress={() => onMoviePress?.(movie)}
            activeOpacity={0.8}
          >
            <Image
              source={{ uri: movie.image }}
              style={styles.poster}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seeAll: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  posterTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
