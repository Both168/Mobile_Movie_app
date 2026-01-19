import { useState } from 'react';
import ContentListScreen from '../../components/ContentListScreen';
import { getSeriesCards, getSeriesGenres, searchSeries } from '../../services/movieService';
import { useRouter } from '../../hooks/useRouter';
import { ROUTES } from '../../utils/routes';

export default function SeriesScreen() {
  const [activeTab, setActiveTab] = useState('series');
  const router = useRouter();

  return (
    <ContentListScreen
      title="Series"
      activeTab={activeTab}
      bannerPosition={3}
      itemType="Series"
      loadCards={async (page, genreId) => await getSeriesCards(page, genreId)}
      loadGenres={async () => await getSeriesGenres()}
      searchFunction={async (query, page) => await searchSeries(query, page)}
      onItemPress={(item) => router.push(ROUTES.SERIES_DETAIL.replace('[id]', item.id.toString()) as any)}
      onTabPress={setActiveTab}
    />
  );
}
