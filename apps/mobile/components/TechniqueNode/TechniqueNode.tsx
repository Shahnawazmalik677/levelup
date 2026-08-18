import React from 'react';
import { Pressable, View } from 'react-native';
import { Text } from 'react-native-paper';
import { TechniqueStatus } from '../../types';
import { colors } from '../../constants/theme';
import { styles } from './styles';

interface TechniqueNodeProps {
  name: string;
  order: number;
  status: TechniqueStatus;
  progress: number;
  difficulty: 'easy' | 'medium' | 'hard';
  onPress?: () => void;
  accentColor?: string;
  isLast?: boolean;
}

const STATUS_CONFIG: Record<TechniqueStatus, {
  bg: string;
  border: string;
  opacity: number;
}> = {
  locked: {
    bg: colors.surfaceLight,
    border: colors.border,
    opacity: 0.5,
  },
  active: {
    bg: colors.primary,
    border: colors.primaryLight,
    opacity: 1,
  },
  completed: {
    bg: colors.primary,
    border: colors.primary,
    opacity: 1,
  },
  skipped: {
    bg: colors.textMuted,
    border: colors.textMuted,
    opacity: 0.6,
  },
};

export const TechniqueNode: React.FC<TechniqueNodeProps> = ({
  name,
  order,
  status,
  progress,
  difficulty,
  onPress,
  accentColor = colors.primary,
  isLast = false,
}) => {
  const config = STATUS_CONFIG[status];
  const isInteractive = status !== 'locked';

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={isInteractive ? onPress : undefined}
        style={({ pressed }) => [
          pressed && isInteractive && styles.pressed,
        ]}
      >
        <View style={[styles.container, { opacity: config.opacity }]}>
          <View style={styles.nodeSection}>
            <View
              style={[
                styles.circle,
                {
                  backgroundColor: status === 'active' ? `${accentColor}30` : `${config.bg}30`,
                  borderColor: status === 'active' ? accentColor : config.border,
                },
              ]}
            >
              {status === 'completed' ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : status === 'locked' ? (
                <Text style={styles.lockIcon}>🔒</Text>
              ) : (
                <Text style={styles.orderText}>{order}</Text>
              )}

              {status === 'active' && progress > 0 && (
                <View
                  style={[
                    styles.progressRing,
                    {
                      borderColor: accentColor,
                      borderTopColor: 'transparent',
                      transform: [{ rotate: `${(progress / 100) * 360}deg` }],
                    },
                  ]}
                />
              )}
            </View>

            {!isLast && (
              <View
                style={[
                  styles.connector,
                  {
                    backgroundColor:
                      status === 'completed' ? colors.primary : colors.border,
                  },
                ]}
              />
            )}
          </View>

          <View style={styles.contentSection}>
            <Text
              variant="titleSmall"
              style={[
                styles.name,
                status === 'completed' && styles.completedName,
                status === 'skipped' && styles.skippedName,
              ]}
              numberOfLines={2}
            >
              {name}
            </Text>
            <View style={styles.meta}>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{difficulty}</Text>
              </View>
              {status === 'active' && progress > 0 && (
                <Text style={styles.progressText}>{progress}%</Text>
              )}
            </View>
          </View>
        </View>
      </Pressable>
    </View>
  );
};
