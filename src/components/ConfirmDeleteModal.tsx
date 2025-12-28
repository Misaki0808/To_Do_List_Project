import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ConfirmDeleteModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmDeleteModal({
  visible,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContainer}>
              <View style={styles.glassCard}>
                {/* İkon */}
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>⚠️</Text>
                </View>

                {/* Başlık */}
                <Text style={styles.title}>{title}</Text>

                {/* Mesaj */}
                <Text style={styles.message}>{message}</Text>

                {/* Butonlar */}
                <View style={styles.buttonContainer}>
                  {/* İptal */}
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={onClose}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cancelButtonText}>İptal</Text>
                  </TouchableOpacity>

                  {/* Sil */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => {
                      onConfirm();
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#ff6b6b', '#ee5a6f']}
                      style={styles.deleteButtonGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.deleteButtonText}>Sil</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 107, 107, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  deleteButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  deleteButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
