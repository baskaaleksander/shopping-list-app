import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ToastVariant = 'error' | 'success';

type ToastOptions = {
  durationMs?: number;
  message: string;
  title?: string;
  variant?: ToastVariant;
};

type ToastState = Required<Omit<ToastOptions, 'durationMs'>> & {
  durationMs: number;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const TOAST_DURATION_MS = 2800;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    Animated.timing(animation, {
      duration: 180,
      easing: Easing.in(Easing.ease),
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        timeoutRef.current = null;
        setToast(null);
      }
    });
  }, [animation]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    Animated.timing(animation, {
      duration: 220,
      easing: Easing.out(Easing.ease),
      toValue: 1,
      useNativeDriver: true,
    }).start();

    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, toast.durationMs);
  }, [animation, hideToast, toast]);

  const showToast = useCallback(
    ({
      durationMs = TOAST_DURATION_MS,
      message,
      title,
      variant = 'success',
    }: ToastOptions) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      animation.stopAnimation();
      animation.setValue(0);

      setToast({
        durationMs,
        message,
        title: title ?? '',
        variant,
      });
    },
    [animation],
  );

  const contextValue = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  const toastTranslateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-32, 0],
  });

  const toastOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={styles.overlay}>
          <Animated.View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            pointerEvents="none"
            style={[
              styles.toast,
              toast.variant === 'success'
                ? styles.successToast
                : styles.errorToast,
              {
                marginTop: insets.top + 8,
                opacity: toastOpacity,
                transform: [{ translateY: toastTranslateY }],
              },
            ]}
          >
            {toast.title ? <Text style={styles.title}>{toast.title}</Text> : null}
            <Text style={styles.message}>{toast.message}</Text>
          </Animated.View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  return context;
}

const shadowStyle: ViewStyle = {
  elevation: 10,
  shadowColor: '#111827',
  shadowOffset: {
    height: 8,
    width: 0,
  },
  shadowOpacity: 0.16,
  shadowRadius: 18,
};

const styles = StyleSheet.create({
  errorToast: {
    backgroundColor: '#991b1b',
  },
  message: {
    color: '#f9fafb',
    fontSize: 14,
    lineHeight: 20,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  successToast: {
    backgroundColor: '#166534',
  },
  title: {
    color: '#f9fafb',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  toast: {
    borderRadius: 16,
    maxWidth: 520,
    paddingHorizontal: 16,
    paddingVertical: 14,
    width: '100%',
    ...shadowStyle,
  },
});
