// Global Toast component using Paper Snackbar
import { StyleSheet, View, Text } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react-native';
import { useToastStore, ToastType } from '@/src/store/toastStore';
import { Colors } from '@/src/constants/colors';
import { scale } from '@/src/utils';

const TYPE_STYLES: Record<ToastType, { bg: string; IconComponent: typeof CheckCircle2 }> = {
  success: { bg: Colors.dark.success, IconComponent: CheckCircle2 },
  error: { bg: Colors.dark.error, IconComponent: XCircle },
  warning: { bg: Colors.dark.warning, IconComponent: AlertTriangle },
  info: { bg: Colors.dark.info, IconComponent: Info },
};

interface ToastItemProps {
  id: string;
  message: string;
  type: ToastType;
}

const ToastItem = ({ id, message, type }: ToastItemProps) => {
  const hideToast = useToastStore((s) => s.hideToast);
  const insets = useSafeAreaInsets();
  const { bg, IconComponent } = TYPE_STYLES[type];

  return (
    <View style={[styles.wrapper, { top: insets.top + scale(60) }]}>
      <Snackbar
        visible
        onDismiss={() => hideToast(id)}
        duration={3000}
        style={[styles.snackbar, { backgroundColor: bg }]}
        action={{ label: '', onPress: () => hideToast(id) }}
      >
        <View style={styles.content}>
          <IconComponent size={scale(18)} color="#fff" style={styles.icon} />
          <View style={styles.textWrapper}>
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>
      </Snackbar>
    </View>
  );
};

export const ToastContainer = () => {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  snackbar: {
    borderRadius: scale(12),
    marginHorizontal: scale(16),
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    width: scale(350),
  },
  icon: {
    marginRight: scale(8),
    flexShrink: 0,
  },
  textWrapper: {
    flex: 1,
  },
  message: {
    color: '#fff',
    fontSize: scale(14),
    lineHeight: scale(20),
  },
});
