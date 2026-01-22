import { useState } from 'react';
import ContentListScreen from '../../components/ContentListScreen';
import { getMoviesCards, getMoviesGenres, searchMovies } from '../../services/movieService';
import { useRouter } from '../../hooks/useRouter';

export default function MovieScreen() {
  const [activeTab, setActiveTab] = useState('movie');
  const router = useRouter();

  return (
    <ContentListScreen
      title="Movies"
      activeTab={activeTab}
      bannerPosition={2}
      itemType="Movie"
      loadCards={async (page, genreId) => await getMoviesCards(page, genreId)}
      loadGenres={async () => await getMoviesGenres()}
      searchFunction={async (query, page) => await searchMovies(query, page)}
      onItemPress={(item) => router.push(`/movie/${item.id}` as any)}
      onTabPress={setActiveTab}
    />
  );
}
