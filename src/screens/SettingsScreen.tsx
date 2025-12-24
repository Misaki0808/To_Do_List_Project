import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function SettingsScreen() {
  const { username, setUsername, plans } = useApp();
  const [nameInput, setNameInput] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // İlk açılışta kullanıcı adı yoksa düzenleme modunu aç
  useEffect(() => {
    if (!username) {
      setIsEditing(true);
    } else {
      setNameInput(username);
    }
  }, [username]);

  // Kullanıcı adını kaydet
  const handleSaveName = async () => {
    if (nameInput.trim() === '') {
      Alert.alert('Uyarı', 'Lütfen bir isim girin');
      return;
    }

    try {
      await setUsername(nameInput.trim());
      setIsEditing(false);
      Alert.alert('Başarılı', 'İsminiz kaydedildi!');
    } catch (error) {
      Alert.alert('Hata', 'İsim kaydedilemedi');
    }
  };

  // İstatistikler hesapla
  const calculateStats = () => {
    const planDates = Object.keys(plans);
    const totalPlans = planDates.length;
    
    let totalTasks = 0;
    let completedTasks = 0;

    planDates.forEach(date => {
      const tasks = plans[date] || [];
      totalTasks += tasks.length;
      completedTasks += tasks.filter(task => task.done).length;
    });

    return { totalPlans, totalTasks, completedTasks };
  };

  const stats = calculateStats();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profil Bölümü */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {username ? username.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>

          {!isEditing ? (
            // İsim Gösterimi
            <View style={styles.nameDisplay}>
              <Text style={styles.greeting}>Merhaba,</Text>
              <Text style={styles.userName}>{username || 'Kullanıcı'}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>✏️ İsmi Değiştir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // İsim Düzenleme
            <View style={styles.nameEdit}>
              <Text style={styles.label}>İsminiz:</Text>
              <TextInput
                style={styles.input}
                placeholder="İsminizi girin"
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
              />
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveName}>
                <Text style={styles.saveButtonText}>💾 Kaydet</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* İstatistikler */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>📊 İstatistikler</Text>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalPlans}</Text>
            <Text style={styles.statLabel}>Toplam Plan</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.totalTasks}</Text>
            <Text style={styles.statLabel}>Toplam Görev</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.completedTasks}</Text>
            <Text style={styles.statLabel}>Tamamlanan Görev</Text>
          </View>

          {stats.totalTasks > 0 && (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
              </Text>
              <Text style={styles.statLabel}>Başarı Oranı</Text>
            </View>
          )}
        </View>

        {/* Hakkında */}
        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>ℹ️ Hakkında</Text>
          <View style={styles.infoCard}>
            <Text style={styles.appName}>DailyPlanner</Text>
            <Text style={styles.appVersion}>Versiyon 1.0.0</Text>
            <Text style={styles.appDescription}>
              Günlük planlarınızı oluşturun, yönetin ve takip edin.
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  nameDisplay: {
    alignItems: 'center',
    width: '100%',
  },
  greeting: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  editButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  editButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  nameEdit: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F2F2F7',
    padding: 16,
    borderRadius: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#34C759',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  aboutSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
