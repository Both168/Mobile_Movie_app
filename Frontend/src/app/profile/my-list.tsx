import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from '../../hooks/useRouter';
import { Colors } from '../../constants/Colors';
import BottomTabBar from '../../components/BottomTabBar';
import { useState, useEffect } from 'react';
import { getMyListCards, TrendingCard, getMovieDetail, getSeriesDetail } from '../../services/movieService';
import { ROUTES } from '../../utils/routes';
import { resolveImageUrl } from '../../utils/apiConfig';
import { MaterialIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_WIDTH = (SCREEN_WIDTH - 60) / 2;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function MyListScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [myListCards, setMyListCards] = useState<TrendingCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyList();
  }, []);

  const loadMyList = async () => {
    try {
      setLoading(true);
      const response = await getMyListCards();
      if (response.success) {
        setMyListCards(response.data);
      }
    } catch (error) {
      console.error('Error loading my list:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardPress = async (card: TrendingCard) => {
    // Try movie detail first
    try {
      const movieResponse = await getMovieDetail(card.id);
      if (movieResponse.success) {
        router.push(ROUTES.MOVIE_DETAIL.replace('[id]', card.id.toString()) as any);
        return;
      }
    } catch (error) {
      // If movie fails, try series
    }
    
    // Try series detail
    try {
      const seriesResponse = await getSeriesDetail(card.id);
      if (seriesResponse.success) {
        router.push(ROUTES.SERIES_DETAIL.replace('[id]', card.id.toString()) as any);
        return;
      }
    } catch (error) {
      console.error('Error determining card type:', error);
    }
  };

  const renderItem = ({ item }: { item: TrendingCard }) => (
    <TouchableOpacity
      style={styles.posterContainer}
      onPress={() => handleCardPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: resolveImageUrl(item.image) ?? undefined }}
        style={styles.poster}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My List</Text>
        <View style={styles.placeholder} />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : myListCards.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your list is empty</Text>
          <Text style={styles.emptySubtext}>Add movies and series to your list to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={myListCards}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.content}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      )}
      
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
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
    paddingHorizontal: 16,
    paddingTop: 50,
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
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginRight: 40,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 100,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  posterContainer: {
    width: POSTER_WIDTH,
    height: POSTER_HEIGHT,
    borderRadius: 8,
    overflow: 'hidden',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
});
