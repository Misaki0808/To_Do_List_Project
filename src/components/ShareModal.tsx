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

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  onWhatsApp: () => void;
  onCopy: () => void;
}

export default function ShareModal({
  visible,
  onClose,
  onWhatsApp,
  onCopy,
}: ShareModalProps) {
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
                {/* Başlık */}
                <View style={styles.header}>
                  <Text style={styles.title}>📤 Planı Paylaş</Text>
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Açıklama */}
                <Text style={styles.description}>
                  Bugünkü planınızı nasıl paylaşmak istersiniz?
                </Text>

                {/* Seçenekler */}
                <View style={styles.optionsContainer}>
                  {/* WhatsApp */}
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => {
                      onWhatsApp();
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#25D366', '#128C7E']}
                      style={styles.optionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.optionEmoji}>💚</Text>
                      <Text style={styles.optionText}>WhatsApp</Text>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Kopyala */}
                  <TouchableOpacity
                    style={styles.optionButton}
                    onPress={() => {
                      onCopy();
                      onClose();
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#667eea', '#764ba2']}
                      style={styles.optionGradient}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.optionEmoji}>📋</Text>
                      <Text style={styles.optionText}>Metni Kopyala</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>

                {/* İptal Butonu */}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.cancelButtonText}>İptal</Text>
                </TouchableOpacity>
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
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
  },
  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    padding: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  optionsContainer: {
    padding: 20,
    paddingTop: 8,
    gap: 12,
  },
  optionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  optionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  optionEmoji: {
    fontSize: 24,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  cancelButton: {
    padding: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
});
