// components/ToastNotification.jsx - React Native Version
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
  Platform,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Toast Context
const ToastContext = React.createContext(null);

// Toast Provider
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3000) => {
    const id = Date.now();
    const newToast = {
      id,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const contextValue = {
    addToast,
    removeToast
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Hook
export function useToast() {
  const context = React.useContext(ToastContext);
  
  if (!context) {
    return {
      addToast: () => {},
      removeToast: () => {}
    };
  }
  return context;
}

// Toast Container
function ToastContainer({ toasts, onRemove }) {
  const statusBarHeight = Platform.OS === 'ios' ? 50 : StatusBar.currentHeight || 0;

  return (
    <View style={[styles.container, { top: statusBarHeight + 16 }]} pointerEvents="box-none">
      {toasts.map((toast, index) => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onRemove={onRemove}
          index={index}
        />
      ))}
    </View>
  );
}

// Individual Toast Component
function Toast({ toast, onRemove, index }) {
  const slideAnim = useRef(new Animated.Value(screenWidth)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Toast giriş animasyonu
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRemove = () => {
    // Toast çıkış animasyonu
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: screenWidth,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onRemove(toast.id);
    });
  };

  const getToastStyle = () => {
    switch (toast.type) {
      case 'success':
        return styles.successToast;
      case 'error':
        return styles.errorToast;
      case 'warning':
        return styles.warningToast;
      case 'info':
        return styles.infoToast;
      default:
        return styles.defaultToast;
    }
  };

  const getTextStyle = () => {
    switch (toast.type) {
      case 'success':
        return styles.successText;
      case 'error':
        return styles.errorText;
      case 'warning':
        return styles.warningText;
      case 'info':
        return styles.infoText;
      default:
        return styles.defaultText;
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  return (
    <Animated.View
      style={[
        styles.toast,
        getToastStyle(),
        {
          transform: [{ translateX: slideAnim }],
          opacity: opacityAnim,
          marginTop: index * 8, // Toast'ları biraz aralıklı göster
        },
      ]}
    >
      <View style={styles.toastContent}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={[styles.message, getTextStyle()]} numberOfLines={3}>
          {toast.message}
        </Text>
        <TouchableOpacity
          onPress={handleRemove}
          style={styles.closeButton}
          activeOpacity={0.7}
        >
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    left: 16,
    zIndex: 9999,
    elevation: 9999, // Android için
  },
  toast: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8, // Android shadow
    borderWidth: 1,
    maxWidth: screenWidth - 32,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
    borderRadius: 12,
    minWidth: 24,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#9CA3AF',
    fontWeight: 'bold',
  },
  // Success styles
  successToast: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  successText: {
    color: '#166534',
  },
  // Error styles
  errorToast: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  errorText: {
    color: '#991B1B',
  },
  // Warning styles
  warningToast: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FED7AA',
  },
  warningText: {
    color: '#92400E',
  },
  // Info styles
  infoToast: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  infoText: {
    color: '#1E40AF',
  },
  // Default styles
  defaultToast: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },
  defaultText: {
    color: '#374151',
  },
});

export default ToastProvider;