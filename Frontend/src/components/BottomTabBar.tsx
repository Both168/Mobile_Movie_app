import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from '../hooks/useRouter';
import { Colors } from '../constants/Colors';

interface BottomTabBarProps {
  activeTab: string;
  onTabPress?: (tab: string) => void;
}

export default function BottomTabBar({ activeTab, onTabPress }: BottomTabBarProps) {
  const router = useRouter();

  const tabs = [
    { id: 'home', icon: 'home', label: 'Home', route: router.ROUTES.HOME },
    { id: 'movie', icon: 'movie', label: 'Movie', route: router.ROUTES.MOVIE },
    { id: 'series', icon: 'tv', label: 'Series', route: router.ROUTES.SERIES },
    { id: 'profile', icon: 'person', label: 'Profile', route: router.ROUTES.PROFILE },
  ];

  const handleTabPress = (tab: { id: string; route: string }) => {
    if (onTabPress) {
      onTabPress(tab.id);
    }
    router.push(tab.route as any);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.tabActive,
          ]}
          onPress={() => handleTabPress(tab)}
          activeOpacity={0.7}
        >
          <MaterialIcons
            name={tab.icon as any}
            size={24}
            color={activeTab === tab.id ? '#FFFFFF' : '#CCCCCC'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 60,
    backgroundColor: '#1a1a1a',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
    borderTopWidth: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    opacity: 1,
  },
});
