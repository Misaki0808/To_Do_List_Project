import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AppProvider, useApp } from './src/context/AppContext';
import 'react-native-gesture-handler';

// Ekranlar
import CreatePlanScreen from './src/screens/CreatePlanScreen';
import MultiDayViewScreen from './src/screens/MultiDayViewScreen';
import PlanOverviewScreen from './src/screens/PlanOverviewScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Custom Drawer
import CustomDrawer from './src/components/CustomDrawer';

const Drawer = createDrawerNavigator();

// Ana uygulama içeriği
function AppContent() {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawer {...props} />}
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#1a1a2e',
            width: 280,
          },
          drawerActiveTintColor: '#fff',
          drawerInactiveTintColor: 'rgba(255,255,255,0.6)',
          drawerActiveBackgroundColor: 'rgba(102, 126, 234, 0.2)',
          drawerItemStyle: {
            borderRadius: 12,
            marginVertical: 4,
          },
          drawerLabelStyle: {
            fontSize: 16,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#667eea',
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      >
        <Drawer.Screen
          name="CreatePlan"
          component={CreatePlanScreen}
          options={{
            title: '📝 Plan Oluştur',
            drawerLabel: 'Plan Oluştur',
          }}
        />
        <Drawer.Screen
          name="MultiDayView"
          component={MultiDayViewScreen}
          options={{
            title: '📅 Planlarım',
            drawerLabel: 'Planlarım',
          }}
        />
        <Drawer.Screen
          name="PlanOverview"
          component={PlanOverviewScreen}
          options={{
            title: '🔍 Genel Bakış',
            drawerLabel: 'Genel Bakış',
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: '⚙️ Ayarlar',
            drawerLabel: 'Ayarlar',
          }}
        />
      </Drawer.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

// Context Provider ile sarmalanmış ana component
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
});
