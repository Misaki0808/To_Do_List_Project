import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { formatDateDisplay, getToday, addDays } from '../utils/dateUtils';
import { Task } from '../types';

export default function MultiDayViewScreen() {
  const { plans, updateTask, refreshPlans } = useApp();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);

  // Seçilen tarih değiştiğinde görevleri güncelle
  useEffect(() => {
    loadTasks();
  }, [selectedDate, plans]);

  // Görevleri yükle
  const loadTasks = () => {
    const tasks = plans[selectedDate] || [];
    setCurrentTasks(tasks);
  };

  // Görev durumunu değiştir (checkbox)
  const toggleTaskDone = async (taskId: string, currentDone: boolean) => {
    try {
      await updateTask(selectedDate, taskId, !currentDone);
      await refreshPlans();
    } catch (error) {
      console.error('Görev güncellenirken hata:', error);
    }
  };

  // Tarih değiştir
  const changeDate = (days: number) => {
    const newDate = addDays(selectedDate, days);
    setSelectedDate(newDate);
  };

  // Tamamlanma durumu
  const completedCount = currentTasks.filter(task => task.done).length;
  const totalCount = currentTasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  return (
    <LinearGradient
      colors={['#4facfe', '#00f2fe', '#43e97b']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.container}>
        {/* Tarih Navigasyonu */}
        <View style={styles.dateNavigation}>
          <View style={styles.glassCard}>
            <View style={styles.navigationContent}>
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => changeDate(-1)}
              >
                <Text style={styles.navButtonText}>←</Text>
              </TouchableOpacity>
              
              <View style={styles.currentDateContainer}>
                <Text style={styles.currentDate}>{formatDateDisplay(selectedDate)}</Text>
                {selectedDate === getToday() && (
                  <View style={styles.todayBadge}>
                    <Text style={styles.todayBadgeText}>BUGÜN</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity
                style={styles.navButton}
                onPress={() => changeDate(1)}
              >
                <Text style={styles.navButtonText}>→</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* İstatistik */}
        {totalCount > 0 && (
          <View style={styles.statsSection}>
            <View style={styles.glassCard}>
              <LinearGradient
                colors={allCompleted ? ['#4facfe', '#00f2fe'] : ['#f093fb', '#f5576c']}
                style={styles.statsGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.statsContent}>
                  <Text style={styles.statsText}>
                    {completedCount} / {totalCount} görev tamamlandı
                  </Text>
                  {allCompleted && <Text style={styles.celebrationText}>🎉</Text>}
                </View>
              </LinearGradient>
            </View>
          </View>
        )}

        {/* Görev Listesi */}
        <ScrollView style={styles.taskList}>
          {currentTasks.length === 0 ? (
            // Boş State
            <View style={styles.emptyState}>
              <View style={styles.emptyStateCard}>
                <Text style={styles.emptyStateIcon}>📭</Text>
                <Text style={styles.emptyStateTitle}>Bu gün için plan yok</Text>
                <Text style={styles.emptyStateSubtitle}>
                  "Plan Oluştur" sekmesinden yeni plan ekleyebilirsiniz
                </Text>
              </View>
            </View>
          ) : (
            // Görevler
            currentTasks.map((task, index) => (
              <View key={task.id} style={styles.taskItemWrapper}>
                <View style={styles.glassCard}>
                  <TouchableOpacity
                    style={styles.taskItem}
                    onPress={() => toggleTaskDone(task.id, task.done)}
                    activeOpacity={0.7}
                  >
                    {/* Checkbox */}
                    <View style={[styles.checkbox, task.done && styles.checkboxChecked]}>
                      {task.done && (
                        <LinearGradient
                          colors={['#4facfe', '#00f2fe']}
                          style={styles.checkboxGradient}
                        >
                          <Text style={styles.checkmark}>✓</Text>
                        </LinearGradient>
                      )}
                    </View>
                    
                    {/* Görev Numarası ve Başlığı */}
                    <View style={styles.taskContent}>
                      <View style={styles.taskNumberBadge}>
                        <Text style={styles.taskNumber}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>
                        {task.title}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  dateNavigation: {
    padding: 16,
  },
  navigationContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  currentDateContainer: {
    alignItems: 'center',
    flex: 1,
  },
  currentDate: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  todayBadge: {
    backgroundColor: 'rgba(67, 233, 123, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsGradient: {
    padding: 16,
    borderRadius: 20,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
  },
  celebrationText: {
    fontSize: 24,
  },
  taskList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  emptyStateIcon: {
    fontSize: 72,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  taskItemWrapper: {
    marginBottom: 12,
  },
  taskItem: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  checkboxChecked: {
    borderColor: 'transparent',
  },
  checkboxGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(79, 172, 254, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
});

