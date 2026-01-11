import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from '../../hooks/useRouter';
import { Colors } from '../../constants/Colors';
import BottomTabBar from '../../components/BottomTabBar';
import { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import { ROUTES } from '../../utils/routes';

export default function SettingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          label: 'Edit Profile',
          onPress: () => {
            router.push(ROUTES.EDIT_PROFILE as any);
          },
        },
        {
          icon: 'lock',
          label: 'Change Password',
          onPress: () => {
            router.push(ROUTES.CHANGE_PASSWORD as any);
          },
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: 'notifications',
          label: 'Notifications',
          rightComponent: (
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: '#FFFFFF' }}
              thumbColor={notificationsEnabled ? '#1a1a1a' : '#f4f3f4'}
            />
          ),
        },
        {
          icon: 'play-arrow',
          label: 'Auto-play Videos',
          rightComponent: (
            <Switch
              value={autoPlayEnabled}
              onValueChange={setAutoPlayEnabled}
              trackColor={{ false: '#767577', true: '#FFFFFF' }}
              thumbColor={autoPlayEnabled ? '#1a1a1a' : '#f4f3f4'}
            />
          ),
        },
      ],
    },
    {
      title: 'Subscribe',
      items: [
        {
          icon: 'card-membership',
          label: 'Subscription Plans',
          onPress: () => {
            // TODO: Navigate to subscription plans
            console.log('Subscription Plans');
          },
        },
        {
          icon: 'payment',
          label: 'Manage Subscription',
          onPress: () => {
            // TODO: Navigate to manage subscription
            console.log('Manage Subscription');
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'info',
          label: 'App Version',
          rightComponent: <Text style={styles.versionText}>1.0.0</Text>,
        },
        {
          icon: 'help',
          label: 'Help & Support',
          onPress: () => {
            // TODO: Navigate to help screen
            console.log('Help & Support');
          },
        },
        {
          icon: 'privacy-tip',
          label: 'Privacy Policy',
          onPress: () => {
            // TODO: Navigate to privacy policy
            console.log('Privacy Policy');
          },
        },
        {
          icon: 'description',
          label: 'Terms of Service',
          onPress: () => {
            // TODO: Navigate to terms of service
            console.log('Terms of Service');
          },
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.settingItem}
                  onPress={item.onPress}
                  activeOpacity={item.onPress ? 0.7 : 1}
                  disabled={!item.onPress}
                >
                  <View style={styles.settingItemLeft}>
                    <MaterialIcons name={item.icon as any} size={24} color="#FFFFFF" />
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  {item.rightComponent || (
                    <MaterialIcons name="chevron-right" size={24} color={Colors.textSecondary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
      <BottomTabBar activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
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
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 22,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 16,
    fontWeight: '500',
  },
  versionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
