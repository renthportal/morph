import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { getMilestones, getProgress } from '../utils/milestones';

interface MilestoneBarProps {
  startDate: string;
  goalDate: string | null;
  afterDate: string | null;
  accentColor: string;
}

export function MilestoneBar({ startDate, goalDate, afterDate, accentColor }: MilestoneBarProps) {
  if (!goalDate) return null;

  const milestones = getMilestones(startDate, goalDate, afterDate);
  const progress = getProgress(startDate, goalDate, afterDate);

  return (
    <View style={styles.container}>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: accentColor }]} />
        {milestones.map((m, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                left: `${m.fraction * 100}%`,
                backgroundColor: m.reached ? accentColor : Colors.textMuted,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.labelsRow}>
        {milestones.map((m, i) => (
          <Text
            key={i}
            style={[
              styles.label,
              { color: m.reached ? accentColor : Colors.textMuted },
            ]}
          >
            {m.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.md,
  },
  barBackground: {
    height: 6,
    backgroundColor: Colors.surface,
    borderRadius: 3,
    position: 'relative',
    overflow: 'visible',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    left: 0,
    top: 0,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    top: -3,
    marginLeft: -6,
    borderWidth: 2,
    borderColor: Colors.card,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  label: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
  },
});
