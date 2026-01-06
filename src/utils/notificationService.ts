import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Bildirim ayarları
// Expo Go SDK 53+ destegi olmadigi icin devre disi birakildi
/*
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
*/

/**
 * Bildirim izni iste
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  // Expo Go: Notifications not supported
  return false;
};

/**
 * Günlük bildirim planla
 * @param hour - Saat (0-23)
 * @param minute - Dakika (0-59)
 * @param tasksCount - Görev sayısı
 */
export const scheduleDailyNotification = async (
  hour: number,
  minute: number,
  tasksCount: number = 0
): Promise<string | null> => {
  // Expo Go: Notifications not supported
  return null;
};

/**
 * Tüm bildirimleri iptal et
 */
export const cancelAllNotifications = async (): Promise<void> => {
  // No-op
};

/**
 * Planlı bildirimleri getir
 */
export const getScheduledNotifications = async () => {
  return [];
};

/**
 * Bildirim izni var mı kontrol et
 */
export const checkNotificationPermissions = async (): Promise<boolean> => {
  return false;
};
