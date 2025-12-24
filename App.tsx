import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { AppProvider, useApp } from './src/context/AppContext';

// Ana uygulama içeriği
function AppContent() {
  const { isLoading } = useApp();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Daily Planner</Text>
      <Text style={styles.subtitle}>Günlük planlama uygulamanız</Text>
      <Text style={styles.info}>Ekranlar yakında eklenecek...</Text>
      <StatusBar style="auto" />
    </View>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  info: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
