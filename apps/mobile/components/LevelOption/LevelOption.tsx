import React from 'react';
import { Pressable, View } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { colors } from '../../constants/theme';
import { styles } from './styles';

interface LevelOptionProps {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  icon?: string;
  accentColor?: string;
  disabled?: boolean;
}

export const LevelOption: React.FC<LevelOptionProps> = ({
  title,
  description,
  selected,
  onPress,
  icon,
  accentColor = colors.primary,
  disabled = false,
}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View
        style={[
          styles.container,
          {
            borderColor: selected ? accentColor : colors.border,
            borderWidth: selected ? 2 : 1,
            backgroundColor: selected ? `${accentColor}10` : colors.card,
          },
          disabled && styles.disabled,
        ]}
      >
        <View style={styles.content}>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <View style={styles.textContainer}>
            <Text variant="titleMedium" style={styles.title}>
              {title}
            </Text>
            <Text variant="bodySmall" style={styles.description}>
              {description}
            </Text>
          </View>
          <RadioButton
            value={title}
            status={selected ? 'checked' : 'unchecked'}
            onPress={onPress}
            color={accentColor}
            uncheckedColor={colors.textMuted}
          />
        </View>
      </View>
    </Pressable>
  );
};
