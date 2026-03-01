import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { Task } from '../types';
import { useApp } from '../context/AppContext';

interface AnimatedTaskItemProps {
  task: Task;
  index: number;
  isEditMode: boolean;
  onToggleDone: () => void;
  onChangePriority: () => void;
  onRemove: () => void;
}

export default function AnimatedTaskItem({
  task,
  index,
  isEditMode,
  onToggleDone,
  onChangePriority,
  onRemove,
}: AnimatedTaskItemProps) {
  const { settings } = useApp();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const swipeableRef = useRef<Swipeable>(null);

  useEffect(() => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [task.id]);

  const priorityColor =
    task.priority === 'high' ? '#F44336' :
      task.priority === 'medium' ? '#FFC107' :
        '#4CAF50';

  const cardBackgroundColor = settings.darkMode
    ? 'rgba(50, 50, 70, 0.95)'
    : 'rgba(255, 255, 255, 0.9)';

  const textColor = settings.darkMode ? '#fff' : '#333';
  const doneTextColor = settings.darkMode ? '#999' : '#999';

  const triggerRemoveAnimation = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove();
    });
  };

  // ← Sola kaydır → Sil (kırmızı arka plan)
  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={styles.swipeActionRight}
        onPress={() => {
          swipeableRef.current?.close();
          triggerRemoveAnimation();
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#ff6b6b', '#ee5a24']}
          style={styles.swipeActionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.swipeActionIcon}>🗑</Text>
          <Text style={styles.swipeActionText}>Sil</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // → Sağa kaydır → Tamamla/Geri Al (yeşil arka plan)
  const renderLeftActions = () => {
    return (
      <TouchableOpacity
        style={styles.swipeActionLeft}
        onPress={() => {
          swipeableRef.current?.close();
          onToggleDone();
        }}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={task.done ? ['#FFC107', '#FF9800'] : ['#00b894', '#00cec9']}
          style={styles.swipeActionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.swipeActionIcon}>{task.done ? '↩️' : '✓'}</Text>
          <Text style={styles.swipeActionText}>{task.done ? 'Geri Al' : 'Tamamla'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  // Swipe threshold aşıldığında otomatik aksiyon
  const handleSwipeOpen = (direction: 'left' | 'right') => {
    if (direction === 'right') {
      // Sola kaydırıldı → sil
      setTimeout(() => {
        swipeableRef.current?.close();
        triggerRemoveAnimation();
      }, 200);
    } else if (direction === 'left') {
      // Sağa kaydırıldı → tamamla
      setTimeout(() => {
        swipeableRef.current?.close();
        onToggleDone();
      }, 200);
    }
  };

  const taskContent = (
    <View style={[
      styles.glassCard,
      {
        borderLeftWidth: 4,
        borderLeftColor: priorityColor,
        backgroundColor: cardBackgroundColor
      }
    ]}>
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => !isEditMode && onToggleDone()}
        activeOpacity={0.7}
        disabled={isEditMode}
      >
        {/* Görev Numarası ve Başlığı */}
        <View style={styles.taskContent}>
          <TouchableOpacity
            style={[styles.taskNumberBadge, { backgroundColor: priorityColor }]}
            onPress={onChangePriority}
            disabled={!isEditMode}
          >
            <Text style={styles.taskNumber}>{index + 1}</Text>
          </TouchableOpacity>
          <Text style={[
            styles.taskTitle,
            { color: textColor },
            task.done && { textDecorationLine: 'line-through', color: doneTextColor }
          ]}>
            {task.title}
          </Text>
        </View>

        {/* Silme Butonu (Edit Mode) */}
        {isEditMode && (
          <TouchableOpacity
            onPress={triggerRemoveAnimation}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <Animated.View
      style={[
        styles.taskItemWrapper,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {isEditMode ? (
        // Edit modda swipe devre dışı
        taskContent
      ) : (
        <Swipeable
          ref={swipeableRef}
          renderRightActions={renderRightActions}
          renderLeftActions={renderLeftActions}
          onSwipeableOpen={handleSwipeOpen}
          overshootRight={false}
          overshootLeft={false}
          friction={2}
          rightThreshold={80}
          leftThreshold={80}
        >
          {taskContent}
        </Swipeable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  taskItemWrapper: {
    marginBottom: 12,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    borderColor: '#4facfe',
  },
  checkboxGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  taskNumber: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  taskTitleDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ff6b6b',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Swipe action styles
  swipeActionRight: {
    justifyContent: 'center',
    marginBottom: 12,
  },
  swipeActionLeft: {
    justifyContent: 'center',
    marginBottom: 12,
  },
  swipeActionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    borderRadius: 16,
    minWidth: 90,
    flexDirection: 'column',
    gap: 4,
  },
  swipeActionIcon: {
    fontSize: 24,
  },
  swipeActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
});
