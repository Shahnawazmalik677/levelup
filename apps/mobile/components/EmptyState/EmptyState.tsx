import React from 'react';
import { View } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { spacing } from '../../constants/theme';
import { styles } from './styles';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  iconSize?: number;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  iconSize = 64,
}) => {
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: iconSize, marginBottom: spacing.md }}>
        {icon}
      </Text>
      <Text variant="headlineSmall" style={styles.title}>
        {title}
      </Text>
      <Text variant="bodyMedium" style={styles.description}>
        {description}
      </Text>
      {actionLabel && onAction && (
        <Button
          mode="contained"
          onPress={onAction}
          style={styles.button}
          labelStyle={styles.buttonLabel}
        >
          {actionLabel}
        </Button>
      )}
    </View>
  );
};
