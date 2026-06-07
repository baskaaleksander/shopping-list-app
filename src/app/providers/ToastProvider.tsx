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
  PanResponder,
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
const TOAST_DISMISS_DRAG_DISTANCE = 48;

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastState | null>(null);
  const animation = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDraggingRef = useRef(false);

  const clearToastTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const hideToast = useCallback(() => {
    clearToastTimer();
    isDraggingRef.current = false;
    Animated.timing(animation, {
      duration: 180,
      easing: Easing.in(Easing.ease),
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        dragY.setValue(0);
        setToast(null);
      }
    });
  }, [animation, clearToastTimer, dragY]);

  const scheduleToastHide = useCallback(
    (durationMs: number) => {
      clearToastTimer();
      timeoutRef.current = setTimeout(() => {
        if (!isDraggingRef.current) {
          hideToast();
        }
      }, durationMs);
    },
    [clearToastTimer, hideToast],
  );

  const dismissToastByDrag = useCallback(() => {
    clearToastTimer();
    isDraggingRef.current = false;
    Animated.parallel([
      Animated.timing(animation, {
        duration: 150,
        easing: Easing.in(Easing.ease),
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(dragY, {
        duration: 150,
        easing: Easing.in(Easing.ease),
        toValue: -96,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        dragY.setValue(0);
        setToast(null);
      }
    });
  }, [animation, clearToastTimer, dragY]);

  useEffect(() => {
    return () => {
      clearToastTimer();
    };
  }, [clearToastTimer]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    dragY.setValue(0);
    Animated.timing(animation, {
      duration: 220,
      easing: Easing.out(Easing.ease),
      toValue: 1,
      useNativeDriver: true,
    }).start();

    scheduleToastHide(toast.durationMs);
  }, [animation, dragY, scheduleToastHide, toast]);

  const showToast = useCallback(
    ({
      durationMs = TOAST_DURATION_MS,
      message,
      title,
      variant = 'success',
    }: ToastOptions) => {
      if (timeoutRef.current) {
        clearToastTimer();
      }

      isDraggingRef.current = false;
      animation.stopAnimation();
      dragY.stopAnimation();
      animation.setValue(0);
      dragY.setValue(0);

      setToast({
        durationMs,
        message,
        title: title ?? '',
        variant,
      });
    },
    [animation, clearToastTimer, dragY],
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

  const combinedTranslateY = Animated.add(toastTranslateY, dragY);
  const toastOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const dragDismissOpacity = dragY.interpolate({
    inputRange: [-96, 0],
    outputRange: [0.65, 1],
    extrapolate: 'clamp',
  });
  const combinedOpacity = Animated.multiply(toastOpacity, dragDismissOpacity);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_event, gestureState) =>
          Boolean(
            toast?.variant === 'success' &&
              Math.abs(gestureState.dy) > 6 &&
              Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
              gestureState.dy < 0,
          ),
        onPanResponderGrant: () => {
          isDraggingRef.current = true;
          clearToastTimer();
        },
        onPanResponderMove: (_event, gestureState) => {
          dragY.setValue(Math.min(0, gestureState.dy));
        },
        onPanResponderRelease: (_event, gestureState) => {
          isDraggingRef.current = false;

          if (
            gestureState.dy <= -TOAST_DISMISS_DRAG_DISTANCE ||
            gestureState.vy <= -0.75
          ) {
            dismissToastByDrag();
            return;
          }

          Animated.spring(dragY, {
            damping: 18,
            mass: 0.7,
            stiffness: 220,
            toValue: 0,
            useNativeDriver: true,
          }).start();

          if (toast) {
            scheduleToastHide(toast.durationMs);
          }
        },
        onPanResponderTerminate: () => {
          isDraggingRef.current = false;
          Animated.spring(dragY, {
            damping: 18,
            mass: 0.7,
            stiffness: 220,
            toValue: 0,
            useNativeDriver: true,
          }).start();

          if (toast) {
            scheduleToastHide(toast.durationMs);
          }
        },
      }),
    [clearToastTimer, dismissToastByDrag, dragY, scheduleToastHide, toast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {toast ? (
        <View pointerEvents="box-none" style={styles.overlay}>
          <Animated.View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            pointerEvents={toast.variant === 'success' ? 'auto' : 'none'}
            {...(toast.variant === 'success' ? panResponder.panHandlers : {})}
            style={[
              styles.toast,
              toast.variant === 'success'
                ? styles.successToast
                : styles.errorToast,
              {
                marginTop: insets.top + 8,
                opacity: combinedOpacity,
                transform: [{ translateY: combinedTranslateY }],
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
