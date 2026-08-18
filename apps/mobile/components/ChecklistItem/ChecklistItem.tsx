import React from 'react';
import { Pressable, View } from 'react-native';
import { Text, Checkbox } from 'react-native-paper';
import { colors } from '../../constants/theme';
import { styles } from './styles';

interface ChecklistItemProps {
  text: string;
  completed: boolean;
  onToggle: () => void;
  disabled?: boolean;
  accentColor?: string;
}

export const ChecklistItem: React.FC<ChecklistItemProps> = ({
  text,
  completed,
  onToggle,
  disabled = false,
  accentColor = colors.primary,
}) => {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={[styles.container, disabled && styles.disabled]}>
        <Checkbox
          status={completed ? 'checked' : 'unchecked'}
          onPress={onToggle}
          color={accentColor}
          uncheckedColor={colors.textMuted}
        />
        <Text
          variant="bodyMedium"
          style={[styles.text, completed && styles.completedText]}
          numberOfLines={3}
        >
          {text}
        </Text>
      </View>
    </Pressable>
  );
};
