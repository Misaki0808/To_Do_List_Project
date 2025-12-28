// Tema renkleri ve stiller

export const lightTheme = {
  // Gradient'ler
  primaryGradient: ['#667eea', '#764ba2', '#f093fb'],
  secondaryGradient: ['#4facfe', '#00f2fe', '#43e97b'],
  accentGradient: ['#f093fb', '#f5576c'],
  warningGradient: ['#ff6b6b', '#ee5a6f'],
  
  // Solid renkler
  background: '#f5f5f5',
  cardBackground: 'rgba(255, 255, 255, 0.25)',
  text: '#333',
  textSecondary: '#666',
  textOnGradient: '#fff',
  border: 'rgba(255, 255, 255, 0.3)',
  
  // Durum renkleri
  success: '#43e97b',
  warning: '#feca57',
  error: '#ff6b6b',
  info: '#4facfe',
  
  // Priority renkleri
  priorityHigh: '#F44336',
  priorityMedium: '#FFC107',
  priorityLow: '#4CAF50',
};

export const darkTheme = {
  // Gradient'ler (koyu versiyonlar)
  primaryGradient: ['#2a2d5a', '#1a1a2e', '#0f0f1e'],
  secondaryGradient: ['#1a3a52', '#0d2438', '#0a1929'],
  accentGradient: ['#7d3c98', '#6c3483'],
  warningGradient: ['#a93226', '#922b21'],
  
  // Solid renkler
  background: '#0f0f1e',
  cardBackground: 'rgba(42, 45, 90, 0.6)',
  text: '#e0e0e0',
  textSecondary: '#b0b0b0',
  textOnGradient: '#fff',
  border: 'rgba(255, 255, 255, 0.1)',
  
  // Durum renkleri (biraz daha koyu)
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',
  
  // Priority renkleri
  priorityHigh: '#e74c3c',
  priorityMedium: '#f39c12',
  priorityLow: '#2ecc71',
};

export type Theme = typeof lightTheme;

export const getTheme = (isDark: boolean): Theme => {
  return isDark ? darkTheme : lightTheme;
};
