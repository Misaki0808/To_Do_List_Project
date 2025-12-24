import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MultiDayViewScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Multi-Day View</Text>
      <Text style={styles.subtitle}>Günlük planları görüntüleme ekranı buraya gelecek</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
