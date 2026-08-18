import React from 'react';
import { View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { colors } from '../../constants/theme';
import { styles } from './styles';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  accentColor?: string;
  size?: 'small' | 'medium';
}

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  value,
  label,
  accentColor = colors.primary,
  size = 'medium',
}) => {
  const isSmall = size === 'small';

  return (
    <Surface
      style={[styles.container, isSmall && styles.containerSmall]}
      elevation={1}
    >
      <View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${accentColor}20`,
            width: isSmall ? 32 : 40,
            height: isSmall ? 32 : 40,
            borderRadius: isSmall ? 16 : 20,
          },
        ]}
      >
        <Text style={{ fontSize: isSmall ? 16 : 20 }}>{icon}</Text>
      </View>
      <Text
        variant={isSmall ? 'titleMedium' : 'headlineSmall'}
        style={[styles.value, { color: accentColor }]}
      >
        {value}
      </Text>
      <Text variant="bodySmall" style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Surface>
  );
};
