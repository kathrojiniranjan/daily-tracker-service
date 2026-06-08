import React from 'react';
import { ActivityIndicator, Button, StyleSheet, Text, View } from 'react-native';

export function LoadingState({ message }: { message: string }): React.JSX.Element {
  return (
    <View style={styles.centered}>
      <ActivityIndicator />
      <Text style={styles.meta}>{message}</Text>
    </View>
  );
}

export function ErrorState({
  message,
  onRetry,
  retryLabel = 'Retry',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}): React.JSX.Element {
  return (
    <View style={styles.centered}>
      <Text style={styles.error}>{message}</Text>
      {onRetry ? <Button title={retryLabel} onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({
  message,
  onRetry,
  retryLabel = 'Refresh',
}: {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}): React.JSX.Element {
  return (
    <View style={styles.centered}>
      <Text style={styles.meta}>{message}</Text>
      {onRetry ? <Button title={retryLabel} onPress={onRetry} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  meta: {
    color: '#4b5563',
  },
  error: {
    color: '#b91c1c',
  },
});
