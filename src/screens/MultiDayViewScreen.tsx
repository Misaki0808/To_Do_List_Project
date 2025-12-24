import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
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
    <View style={styles.container}>
      {/* Tarih Navigasyonu */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changeDate(-1)}
        >
          <Text style={styles.navButtonText}>← Önceki Gün</Text>
        </TouchableOpacity>
        
        <View style={styles.currentDateContainer}>
          <Text style={styles.currentDate}>{formatDateDisplay(selectedDate)}</Text>
          {selectedDate === getToday() && (
            <Text style={styles.todayBadge}>BUGÜN</Text>
          )}
        </View>
        
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => changeDate(1)}
        >
          <Text style={styles.navButtonText}>Sonraki Gün →</Text>
        </TouchableOpacity>
      </View>

      {/* İstatistik */}
      {totalCount > 0 && (
        <View style={[styles.statsContainer, allCompleted && styles.statsCompleted]}>
          <Text style={styles.statsText}>
            {completedCount} / {totalCount} görev tamamlandı
          </Text>
          {allCompleted && <Text style={styles.celebrationText}>🎉 Tebrikler!</Text>}
        </View>
      )}

      {/* Görev Listesi */}
      <ScrollView style={styles.taskList}>
        {currentTasks.length === 0 ? (
          // Boş State
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>Bu gün için plan yok</Text>
            <Text style={styles.emptyStateSubtitle}>
              "Plan Oluştur" sekmesinden yeni plan ekleyebilirsiniz
            </Text>
          </View>
        ) : (
          // Görevler
          currentTasks.map((task, index) => (
            <TouchableOpacity
              key={task.id}
              style={styles.taskItem}
              onPress={() => toggleTaskDone(task.id, task.done)}
              activeOpacity={0.7}
            >
              {/* Checkbox */}
              <View style={[styles.checkbox, task.done && styles.checkboxChecked]}>
                {task.done && <Text style={styles.checkmark}>✓</Text>}
              </View>
              
              {/* Görev Numarası ve Başlığı */}
              <View style={styles.taskContent}>
                <Text style={styles.taskNumber}>{index + 1}.</Text>
                <Text style={[styles.taskTitle, task.done && styles.taskTitleDone]}>
                  {task.title}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  navButton: {
    padding: 8,
  },
  navButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  currentDateContainer: {
    alignItems: 'center',
  },
  currentDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  todayBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  statsContainer: {
    backgroundColor: '#007AFF',
    padding: 12,
    margin: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsCompleted: {
    backgroundColor: '#34C759',
  },
  statsText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  celebrationText: {
    fontSize: 18,
  },
  taskList: {
    flex: 1,
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  taskItem: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
  },
  taskTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#8E8E93',
  },
});
