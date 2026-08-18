import React from 'react';
import { Pressable, View } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { spacing } from '../../constants/theme';
import { styles } from './styles';

interface HobbyCardProps {
  name: string;
  icon: string;
  description: string;
  selected?: boolean;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
}

export const HobbyCard: React.FC<HobbyCardProps> = ({
  name,
  icon,
  description,
  selected = false,
  onPress,
  size = 'medium',
  disabled = false,
}) => {
  const sizeStyles = {
    small: { width: 100, iconSize: 28, padding: spacing.sm },
    medium: { width: '48%' as const, iconSize: 36, padding: spacing.md },
    large: { width: '100%' as const, iconSize: 44, padding: spacing.lg },
  };

  const config = sizeStyles[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressable,
        { width: config.width },
        pressed && styles.pressed,
      ]}
    >
      <Surface
        style={[
          styles.container,
          selected && styles.containerSelected,
          {
            padding: config.padding,
            borderWidth: selected ? 2 : 1,
          },
          disabled && styles.disabled,
        ]}
        elevation={selected ? 2 : 1}
      >
        <View
          style={[
            styles.iconContainer,
            {
              width: config.iconSize + 20,
              height: config.iconSize + 20,
            },
          ]}
        >
          <Text
            style={[
              { fontSize: config.iconSize },
              !selected && styles.iconDimmed,
            ]}
          >
            {icon}
          </Text>
        </View>
        <Text
          variant={size === 'large' ? 'titleMedium' : 'labelLarge'}
          style={styles.name}
          numberOfLines={1}
        >
          {name}
        </Text>
        {size === 'large' && (
          <Text variant="bodySmall" style={styles.description} numberOfLines={2}>
            {description}
          </Text>
        )}
        {selected && <View style={styles.selectedDot} />}
      </Surface>
    </Pressable>
  );
};
