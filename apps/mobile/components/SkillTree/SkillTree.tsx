import React from 'react';
import { View } from 'react-native';
import { Text, ProgressBar } from 'react-native-paper';
import { Technique } from '../../types';
import { TechniqueNode } from '../TechniqueNode';
import { colors } from '../../constants/theme';
import { styles } from './styles';

interface SkillTreeProps {
  techniques: Technique[];
  onTechniquePress: (technique: Technique) => void;
  hobbyName?: string;
  accentColor?: string;
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  techniques,
  onTechniquePress,
  hobbyName,
  accentColor = colors.primary,
}) => {
  const completedCount = techniques.filter(
    (t) => t.status === 'completed'
  ).length;
  const totalCount = techniques.filter(
    (t) => t.status !== 'skipped'
  ).length;
  const overallProgress = totalCount > 0 ? completedCount / totalCount : 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {hobbyName && (
          <Text variant="headlineSmall" style={styles.hobbyName}>
            {hobbyName}
          </Text>
        )}
        <View style={styles.progressRow}>
          <Text variant="bodySmall" style={styles.progressLabel}>
            {completedCount} of {totalCount} techniques
          </Text>
          <Text
            variant="bodySmall"
            style={[styles.progressPercent, { color: accentColor }]}
          >
            {Math.round(overallProgress * 100)}%
          </Text>
        </View>
        <ProgressBar
          progress={overallProgress}
          color={accentColor}
          style={styles.progressBar}
        />
      </View>

      <View style={styles.tree}>
        {techniques.map((technique, index) => (
          <TechniqueNode
            key={technique.id}
            name={technique.name}
            order={index + 1}
            status={technique.status}
            progress={technique.progress}
            difficulty={technique.difficulty}
            onPress={() => onTechniquePress(technique)}
            accentColor={accentColor}
            isLast={index === techniques.length - 1}
          />
        ))}
      </View>
    </View>
  );
};
