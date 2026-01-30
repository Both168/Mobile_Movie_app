import { View, StyleSheet, FlatList, Image, TouchableOpacity, ActivityIndicator, Dimensions, Text, Modal, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import BottomTabBar from './BottomTabBar';
import Header from './Header';
import { useState, useEffect, useCallback, useRef } from 'react';
import BannerSlider from './BannerSlider';
import { TrendingCard, Pagination, Genre, SeriesResponse, GenreResponse } from '../services/movieService';
import { Colors } from '../constants/Colors';
import { resolveImageUrl } from '../utils/apiConfig';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const POSTER_WIDTH = (SCREEN_WIDTH - 60) / 2;
const POSTER_HEIGHT = POSTER_WIDTH * 1.5;

interface ContentListScreenProps {
  title: string;
  activeTab: string;
  bannerPosition: number;
  onItemPress?: (item: TrendingCard) => void;
  loadCards: (page: number, genreId?: number) => Promise<SeriesResponse>;
  loadGenres: () => Promise<GenreResponse>;
  searchFunction: (query: string, page: number) => Promise<SeriesResponse>;
  itemType?: string;
  onTabPress?: (tab: string) => void;
}

export default function ContentListScreen({
  title,
  activeTab,
  bannerPosition,
  onItemPress,
  loadCards,
  loadGenres,
  searchFunction,
  itemType = 'Item',
  onTabPress,
}: ContentListScreenProps) {
  const [cards, setCards] = useState<TrendingCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TrendingCard[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchLoadingMore, setSearchLoadingMore] = useState(false);
  const [searchPagination, setSearchPagination] = useState<Pagination | null>(null);
  const [searchPage, setSearchPage] = useState(1);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      loadGenresData();
      loadCardsData(1, true);
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

  const loadGenresData = async () => {
    try {
      const response = await loadGenres();
      if (response.success) {
        setGenres(response.data);
      }
    } catch (error) {
      console.error(`Error loading genres:`, error);
    }
  };

  const loadCardsData = async (page: number, isInitial: boolean = false, genreId?: number) => {
    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await loadCards(page, genreId);
      if (response.success) {
        if (isInitial) {
          setCards(response.data);
        } else {
          setCards((prev) => [...prev, ...response.data]);
        }
        setPagination(response.pagination);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error(`Error loading cards:`, error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleGenreSelect = (genre: Genre | null) => {
    setSelectedGenre(genre);
    setDropdownVisible(false);
    setCurrentPage(1);
    loadCardsData(1, true, genre?.id);
  };

  const handleSearch = async (query: string, page: number = 1, isInitial: boolean = false) => {
    if (!query.trim()) return;

    if (isInitial) {
      setSearchLoading(true);
    } else {
      setSearchLoadingMore(true);
    }

    try {
      const response = await searchFunction(query, page);
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
      console.error(`Error searching:`, error);
    } finally {
      setSearchLoading(false);
      setSearchLoadingMore(false);
    }
  };

  const loadMore = useCallback(() => {
    if (searchQuery.trim()) {
      if (searchPagination && searchPage < searchPagination.last_page && !searchLoadingMore && !searchLoading) {
        handleSearch(searchQuery, searchPage + 1, false);
      }
    } else {
      if (pagination && currentPage < pagination.last_page && !loadingMore && !loading) {
        loadCardsData(currentPage + 1, false, selectedGenre?.id);
      }
    }
  }, [pagination, currentPage, loadingMore, loading, selectedGenre, searchPagination, searchPage, searchLoadingMore, searchLoading, searchQuery]);

  const renderItem = ({ item }: { item: TrendingCard }) => (
    <TouchableOpacity
      style={styles.posterContainer}
      onPress={() => {
        if (onItemPress) {
          onItemPress(item);
        } else {
          console.log(`${itemType} pressed:`, item);
        }
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{ uri: resolveImageUrl(item.image) ?? undefined }}
        style={styles.poster}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  const isSearching = searchQuery.trim().length > 0;
  const displayData = isSearching ? searchResults : cards;
  const displayLoading = isSearching ? searchLoading : loading;
  const displayLoadingMore = isSearching ? searchLoadingMore : loadingMore;

  if (displayLoading && displayData.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Header title={title} onSearch={setSearchQuery} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
        <BottomTabBar activeTab={activeTab} onTabPress={onTabPress} />
      </View>
    );
  }

  const renderHeader = () => {
    if (isSearching) return null;
    return (
      <View>
        <BannerSlider position={bannerPosition} />
        <View style={styles.genreContainer}>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setDropdownVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.dropdownText}>
              {selectedGenre ? selectedGenre.name : 'All Genres'}
            </Text>
            <MaterialIcons
              name={dropdownVisible ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!displayLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#FFFFFF" />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Header title={title} onSearch={setSearchQuery} />

      {!isSearching && (
        <Modal
          visible={dropdownVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <ScrollView
              style={styles.dropdownScroll}
              contentContainerStyle={styles.dropdownContent}
              showsVerticalScrollIndicator={false}
            >
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => handleGenreSelect(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownItemText}>All Genres</Text>
                {!selectedGenre && (
                  <MaterialIcons name="check" size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={styles.dropdownItem}
                  onPress={() => handleGenreSelect(genre)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.dropdownItemText}>{genre.name}</Text>
                  {selectedGenre?.id === genre.id && (
                    <MaterialIcons name="check" size={20} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setDropdownVisible(false)}
              activeOpacity={0.8}
            >
              <MaterialIcons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
        </Modal>
      )}

      <FlatList
        data={displayData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
      <BottomTabBar activeTab={activeTab} onTabPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
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
  genreContainer: {
    paddingLeft: 0,
    paddingRight: 20,
    paddingVertical: 12,
    backgroundColor: '#000000',
    alignItems: 'flex-start',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    width: 150,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingTop: 60,
    paddingBottom: 100,
  },
  dropdownScroll: {
    flex: 1,
  },
  dropdownContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 0,
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  closeButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
