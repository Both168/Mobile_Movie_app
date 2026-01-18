import { View, StyleSheet, ScrollView, TouchableOpacity, FlatList, Image, ActivityIndicator, Dimensions, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import BottomTabBar from '../../components/BottomTabBar';
import { useState, useEffect, useCallback, useRef } from 'react';
import BannerSlider from '../../components/BannerSlider';
import MovieList from '../../components/MovieList';
import { getTrendingCards, getMyListCards, getDramaListCards, getMayLike, searchAll, TrendingCard, Pagination, getMovieDetail, getSeriesDetail } from '../../services/movieService';
import { Colors } from '../../constants/Colors';
import Header from '../../components/Header';
import { useRouter } from '../../hooks/useRouter';
import { ROUTES } from '../../utils/routes';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_WIDTH = (SCREEN_WIDTH - 60) / 2;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('home');
  const [trendingCards, setTrendingCards] = useState<TrendingCard[]>([]);
  const [myListCards, setMyListCards] = useState<TrendingCard[]>([]);
  const [dramaCards, setDramaCards] = useState<TrendingCard[]>([]);
  const [mayLikeCards, setMayLikeCards] = useState<TrendingCard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TrendingCard[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchPagination, setSearchPagination] = useState<Pagination | null>(null);
  const [searchPage, setSearchPage] = useState(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      handleSearch(searchQuery, 1, true);
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      loadTrendingCards();
      loadMyList();
      loadDramaCards();
      loadMayLike();
    }
  }, [searchQuery]);

  const loadTrendingCards = async () => {
    try {
      const response = await getTrendingCards();
      if (response.success) {
        setTrendingCards(response.data);
      }
    } catch (error) {
      console.error('Error loading trending cards:', error);
    }
  };

  const loadMyList = async () => {
    try {
      const response = await getMyListCards();
      if (response.success) {
        setMyListCards(response.data);
      }
    } catch (error) {
      console.error('Error loading my list:', error);
    }
  };

  const loadDramaCards = async () => {
    try {
      const response = await getDramaListCards();
      if (response.success) {
        setDramaCards(response.data);
      }
    } catch (error) {
      console.error('Error loading drama cards:', error);
    }
  };

  const loadMayLike = async () => {
    try {
      const response = await getMayLike();
      if (response.success) {
        setMayLikeCards(response.data);
      }
    } catch (error) {
      console.error('Error loading may like cards:', error);
    }
  };

  const handleSearch = async (query: string, page: number = 1, isInitial: boolean = false) => {
    if (!query.trim()) return;

    if (isInitial) {
      setSearchLoading(true);
    } else {
      setSearchLoadingMore(true);
    }

    try {
      const response = await searchAll(query, page);
      if (response.success) {
        if (isInitial) {
          setSearchResults(response.data);
        } else {
          setSearchResults((prev) => [...prev, ...response.data]);
        }
        setSearchPagination(response.pagination);
        setSearchPage(page);
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearchLoading(false);
      setSearchLoadingMore(false);
    }
  };

  const loadMoreSearch = useCallback(() => {
    if (searchPagination && searchPage < searchPagination.last_page && !searchLoadingMore && !searchLoading && searchQuery.trim()) {
      handleSearch(searchQuery, searchPage + 1, false);
    }
  }, [searchPagination, searchPage, searchLoadingMore, searchLoading, searchQuery]);

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

  const renderSearchItem = ({ item }: { item: TrendingCard }) => (
    <TouchableOpacity
      style={styles.posterContainer}
      onPress={() => handleCardPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: item.image }}
        style={styles.poster}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const renderSearchFooter = () => {
    if (!searchLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header title="Home" onSearch={setSearchQuery} />

      {isSearching ? (
        <>
          {searchLoading && searchResults.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderSearchItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={2}
              contentContainerStyle={styles.searchContent}
              columnWrapperStyle={styles.row}
              onEndReached={loadMoreSearch}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderSearchFooter}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      ) : (
        <FlatList
          data={[]}
          renderItem={() => null}
          ListHeaderComponent={() => (
            <View>
              <BannerSlider position={1} />
              <View style={styles.content}>
                <MovieList
                  title="Trending Now"
                  movies={trendingCards}
                  onMoviePress={handleCardPress}
                />
                <MovieList
                  title="My List"
                  movies={myListCards}
                  onMoviePress={handleCardPress}
                />
                <MovieList
                  title="You May Like"
                  movies={mayLikeCards}
                  onMoviePress={handleCardPress}
                />
                <MovieList
                  title="Drama"
                  movies={dramaCards}
                  onMoviePress={handleCardPress}
                />
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
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
  listContent: {
    paddingBottom: 100,
  },
  content: {
    backgroundColor: '#000000',
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContent: {
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
