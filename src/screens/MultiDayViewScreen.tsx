import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Linking,
  Share,
  TextInput,
  Animated as RNAnimated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { formatDateDisplay, getToday, addDays } from '../utils/dateUtils';
import { Task } from '../types';
import CopyPlanModal from '../components/CopyPlanModal';
import ShareModal from '../components/ShareModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import AnimatedTaskItem from '../components/AnimatedTaskItem';
import VoiceInputButton from '../components/VoiceInputButton';

// Sadece native platformlarda import et
let RNShare: any = null;
if (Platform.OS !== 'web') {
  try {
    RNShare = require('react-native-share').default;
  } catch (e) {
    // react-native-share not available on web
  }
}

export default function MultiDayViewScreen() {
  const { plans, updateTask, refreshPlans, savePlan, deletePlan, settings, theme } = useApp();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [currentTasks, setCurrentTasks] = useState<Task[]>([]);
  const [isEditMode, setIsEditMode] = useState(false); // Düzenleme modu
  const [isCopyModalVisible, setIsCopyModalVisible] = useState(false); // Kopyalama modal
  const [isShareModalVisible, setIsShareModalVisible] = useState(false); // Paylaşım modal
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletedTask, setDeletedTask] = useState<Task | null>(null);
  const [quickAddText, setQuickAddText] = useState('');
  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const undoAnim = useRef(new RNAnimated.Value(0)).current;

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

  // Yüzdelik hesaplama (priority'ye göre ağırlıklı)
  const calculatePercentage = () => {
    if (totalCount === 0) return 0;

    const totalWeight = currentTasks.reduce((sum, task) => {
      const weight = task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1;
      return sum + weight;
    }, 0);

    const completedWeight = currentTasks
      .filter(task => task.done)
      .reduce((sum, task) => {
        const weight = task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1;
        return sum + weight;
      }, 0);

    return Math.round((completedWeight / totalWeight) * 100);
  };

  const percentage = calculatePercentage();

  // Gorev sil (edit mode veya swipe) + geri al destegi
  const handleRemoveTask = async (taskId: string) => {
    const taskToDelete = currentTasks.find(task => task.id === taskId);
    const updatedTasks = currentTasks.filter(task => task.id !== taskId);
    await savePlan(selectedDate, updatedTasks);
    await refreshPlans();
    if (taskToDelete) {
      setDeletedTask(taskToDelete);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
      RNAnimated.timing(undoAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      undoTimeoutRef.current = setTimeout(() => {
        RNAnimated.timing(undoAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
          setDeletedTask(null);
        });
      }, 5000);
    }
  };

  // Geri al
  const handleUndoDelete = async () => {
    if (!deletedTask) return;
    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    const restoredTasks = [...currentTasks, deletedTask];
    await savePlan(selectedDate, restoredTasks);
    await refreshPlans();
    RNAnimated.timing(undoAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    setDeletedTask(null);
  };

  // Hizli gorev ekle
  const handleQuickAddTask = async () => {
    const title = quickAddText.trim();
    if (!title) return;
    const newTask: Task = {
      id: Date.now().toString() + Math.random().toString(),
      title,
      done: false,
      priority: 'low',
    };
    const updatedTasks = [...currentTasks, newTask];
    await savePlan(selectedDate, updatedTasks);
    await refreshPlans();
    setQuickAddText('');
  };

  // Priority değiştir (edit mode)
  const handleChangePriority = async (taskId: string) => {
    const updatedTasks = currentTasks.map(task => {
      if (task.id === taskId) {
        const nextPriority: 'low' | 'medium' | 'high' =
          task.priority === 'low' ? 'medium' :
            task.priority === 'medium' ? 'high' :
              'low';
        return { ...task, priority: nextPriority };
      }
      return task;
    });
    await savePlan(selectedDate, updatedTasks);
    await refreshPlans();
  };

  // Tüm günü sil
  const handleDeleteDay = async () => {
    // Ayarlarda "daima sor" aktifse onay iste
    if (settings?.askBeforeDeleteAll) {
      if (Platform.OS === 'web') {
        // Web'de custom modal kullan
        setIsDeleteModalVisible(true);
      } else {
        // Mobilde Alert kullan
        Alert.alert(
          'Tüm Planları Sil',
          `${formatDateDisplay(selectedDate)} tarihindeki tüm görevleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`,
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Sil',
              style: 'destructive',
              onPress: confirmDelete
            }
          ]
        );
      }
    } else {
      // Ayar kapalıysa direkt sil
      await confirmDelete();
    }
  };

  // Silme onaylandıktan sonra
  const confirmDelete = async () => {
    await deletePlan(selectedDate);
    setCurrentTasks([]);
    setIsEditMode(false);
  };

  // Planı kopyala
  const handleCopyPlan = async (targetDate: string, selectedTasks: Task[]) => {
    const existingTasks = plans[targetDate] || [];

    // Yeni görevlere benzersiz ID ver
    const newTasks = selectedTasks.map(task => ({
      ...task,
      id: Date.now().toString() + Math.random().toString(),
      done: false, // Kopyalanan görevler tamamlanmamış olarak başlasın
    }));

    // Mevcut görevlerle birleştir
    const allTasks = [...existingTasks, ...newTasks];
    await savePlan(targetDate, allTasks);
    await refreshPlans();

    Alert.alert(
      'Başarılı',
      `${selectedTasks.length} görev ${targetDate} tarihine kopyalandı.`,
      [{ text: 'Tamam' }]
    );
  };

  // Planı paylaş (WhatsApp, Instagram, vb.)
  const handleSharePlan = async () => {
    if (currentTasks.length === 0) {
      if (Platform.OS === 'web') {
        window.alert('Paylaşılacak görev yok');
      } else {
        Alert.alert('Uyarı', 'Paylaşılacak görev yok');
      }
      return;
    }

    // Paylaşım metnini oluştur
    let shareText = `📅 ${formatDateDisplay(selectedDate)}\n`;
    shareText += `📝 Bugünkü Planım (${completedCount}/${totalCount} tamamlandı)\n\n`;

    currentTasks.forEach((task, index) => {
      const emoji = task.done ? '✅' : '⬜';
      const priorityEmoji =
        task.priority === 'high' ? '🔴' :
          task.priority === 'medium' ? '🟡' :
            '🟢';
      shareText += `${emoji} ${priorityEmoji} ${index + 1}. ${task.title}\n`;
    });

    shareText += `\n💪 ${percentage}% tamamlandı!\n`;
    shareText += `\n#DailyPlanner #PlanımıPaylaşıyorum`;

    try {
      if (Platform.OS === 'web') {
        // Web'de modal göster
        setIsShareModalVisible(true);
      } else {
        // Mobilde share sheet
        if (RNShare) {
          try {
            await RNShare.open({
              message: shareText,
              social: RNShare.Social.WHATSAPP,
              failOnCancel: false,
            });
          } catch (err: any) {
            if (err.message !== 'User did not share') {
              await Share.share({ message: shareText });
            }
          }
        } else {
          await Share.share({ message: shareText });
        }
      }
    } catch (error) {
      console.error('Paylaşım hatası:', error);
      if (Platform.OS === 'web') {
        window.alert('Plan paylaşılırken hata oluştu');
      } else {
        Alert.alert('Hata', 'Plan paylaşılırken hata oluştu');
      }
    }
  };

  // Paylaşım metnini oluştur (modal için)
  const getShareText = () => {
    let shareText = `📅 ${formatDateDisplay(selectedDate)}\n`;
    shareText += `📝 Bugünkü Planım (${completedCount}/${totalCount} tamamlandı)\n\n`;

    currentTasks.forEach((task, index) => {
      const emoji = task.done ? '✅' : '⬜';
      const priorityEmoji =
        task.priority === 'high' ? '🔴' :
          task.priority === 'medium' ? '🟡' :
            '🟢';
      shareText += `${emoji} ${priorityEmoji} ${index + 1}. ${task.title}\n`;
    });

    shareText += `\n💪 ${percentage}% tamamlandı!\n`;
    shareText += `\n#DailyPlanner #PlanımıPaylaşıyorum`;

    return shareText;
  };

  // WhatsApp'a paylaş
  const shareViaWhatsApp = () => {
    const shareText = getShareText();
    const encodedText = encodeURIComponent(shareText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  // Metni kopyala
  const copyToClipboard = async () => {
    const shareText = getShareText();

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(shareText);
        window.alert('✅ Plan metni kopyalandı!');
      } else {
        window.alert('❌ Kopyalama desteklenmiyor');
      }
    } catch (error) {
      window.alert('❌ Kopyalama başarısız');
    }
  };

  return (
    <LinearGradient
      colors={settings.darkMode ? ['#2a2d5a', '#1a1a2e', '#0f0f1e'] : ['#4facfe', '#00f2fe', '#43e97b']}
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

          {/* Buton Grubu */}
          {totalCount > 0 && (
            <View style={styles.buttonGroup}>
              {!isEditMode ? (
                // Normal mod - Düzenle, Paylaş, Kopyala
                <>
                  {/* Düzenleme Butonu */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setIsEditMode(true)}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.actionButtonText}>⚙️ Düzenle</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Paylaşma Butonu */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={handleSharePlan}
                  >
                    <LinearGradient
                      colors={['#4facfe', '#00f2fe']}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.actionButtonText}>📤 Paylaş</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Kopyalama Butonu */}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setIsCopyModalVisible(true)}
                  >
                    <LinearGradient
                      colors={['#f093fb', '#f5576c']}
                      style={styles.actionButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.actionButtonText}>📋 Kopyala</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              ) : (
                // Edit mod
                <>
                  {/* Hizli Gorev Ekle - input ile ic ice */}
                  <View style={styles.quickAddWrapper}>
                    <TextInput
                      style={styles.quickAddInput}
                      placeholder="Yeni gorev ekle..."
                      placeholderTextColor="rgba(255,255,255,0.5)"
                      value={quickAddText}
                      onChangeText={setQuickAddText}
                      onSubmitEditing={handleQuickAddTask}
                      returnKeyType="done"
                    />
                    <VoiceInputButton
                      mode="task"
                      onTranscript={(text, isFinal) => {
                        if (isFinal) setQuickAddText(text);
                        else setQuickAddText(text);
                      }}
                    />
                    <TouchableOpacity
                      onPress={handleQuickAddTask}
                      disabled={quickAddText.trim() === ''}
                      activeOpacity={0.7}
                      style={styles.quickAddBtnInline}
                    >
                      <LinearGradient
                        colors={quickAddText.trim() === '' ? ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.1)'] : ['#00b894', '#00cec9']}
                        style={styles.quickAddButton}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                      >
                        <Text style={styles.quickAddButtonText}>+</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>

                  {/* Bitti + Sil (kompakt) */}
                  <TouchableOpacity
                    onPress={() => setIsEditMode(false)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#f093fb', '#f5576c']}
                      style={styles.compactButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.compactButtonText}>{"\u2715"}</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleDeleteDay}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#ff6b6b', '#ee5a6f']}
                      style={styles.compactButton}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.compactButtonIcon}>{"\uD83D\uDDD1"}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
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
                  <Text style={styles.percentageText}>%{percentage}</Text>
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
            currentTasks.map((task, index) => (
              <AnimatedTaskItem
                key={task.id}
                task={task}
                index={index}
                isEditMode={isEditMode}
                onToggleDone={() => toggleTaskDone(task.id, task.done)}
                onChangePriority={() => handleChangePriority(task.id)}
                onRemove={() => handleRemoveTask(task.id)}
              />
            ))
          )}
        </ScrollView>

        {/* Geri Al Snackbar */}
        {deletedTask && (
          <RNAnimated.View style={[
            styles.undoSnackbar,
            {
              opacity: undoAnim,
              transform: [{ translateY: undoAnim.interpolate({ inputRange: [0, 1], outputRange: [60, 0] }) }],
            },
          ]}>
            <Text style={styles.undoText} numberOfLines={1}>{deletedTask.title} silindi</Text>
            <TouchableOpacity onPress={handleUndoDelete} activeOpacity={0.7}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                style={styles.undoButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.undoButtonText}>Geri Al</Text>
              </LinearGradient>
            </TouchableOpacity>
          </RNAnimated.View>
        )}

        {/* Kopyalama Modal */}
        <CopyPlanModal
          visible={isCopyModalVisible}
          onClose={() => setIsCopyModalVisible(false)}
          sourceTasks={currentTasks}
          sourceDate={formatDateDisplay(selectedDate)}
          onCopy={handleCopyPlan}
        />

        {/* Paylaşma Modal */}
        <ShareModal
          visible={isShareModalVisible}
          onClose={() => setIsShareModalVisible(false)}
          onWhatsApp={shareViaWhatsApp}
          onCopy={copyToClipboard}
        />

        {/* Silme Onay Modal */}
        <ConfirmDeleteModal
          visible={isDeleteModalVisible}
          onClose={() => setIsDeleteModalVisible(false)}
          onConfirm={confirmDelete}
          title="Tüm Planları Sil"
          message={`${formatDateDisplay(selectedDate)} tarihindeki tüm görevleri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        />
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
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  deleteButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
  },
  statsSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  statsGradient: {
    padding: 12,
    borderRadius: 16,
  },
  statsContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  celebrationText: {
    fontSize: 20,
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
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(245, 87, 108, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  quickAddWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 4,
    paddingVertical: 4,
    marginRight: 8,
  },
  quickAddInput: {
    flex: 1,
    height: 36,
    fontSize: 14,
    color: '#fff',
    outlineStyle: 'none' as any,
  },
  quickAddBtnInline: {
    marginLeft: 4,
  },
  quickAddButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddButtonText: {
    fontSize: 20,
    color: '#fff',
    fontWeight: '700',
  },
  compactButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '700',
  },
  compactButtonIcon: {
    fontSize: 18,
  },
  undoSnackbar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(30, 30, 50, 0.95)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  undoText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
    marginRight: 12,
  },
  undoButtonGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  undoButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});

