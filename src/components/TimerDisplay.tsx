import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, FontFamily, FontSize, Spacing } from '../constants/theme';
import { useTimer } from '../hooks/useTimer';

interface TimerDisplayProps {
  startDate: string;
  endDate?: string | null;
  goalDate?: string | null;
  accentColor: string;
  compact?: boolean;
}

export function TimerDisplay({
  startDate,
  endDate,
  goalDate,
  accentColor,
  compact = false,
}: TimerDisplayProps) {
  const timer = useTimer(startDate, endDate, goalDate);

  const units = [
    { value: timer.years, label: 'Y' },
    { value: timer.months, label: 'MO' },
    { value: timer.days, label: 'D' },
    { value: timer.hours, label: 'H' },
    { value: timer.minutes, label: 'M' },
    { value: timer.seconds, label: 'S' },
  ];

  // Filter out leading zeros
  const startIdx = units.findIndex((u) => u.value > 0);
  const visibleUnits = startIdx >= 0 ? units.slice(startIdx) : units.slice(-3);

  if (compact) {
    return (
      <View style={styles.compactRow}>
        {visibleUnits.slice(0, 4).map((u, i) => (
          <Text key={i} style={[styles.compactText, { color: accentColor }]}>
            {u.value}
            <Text style={styles.compactLabel}>{u.label}</Text>
            {i < Math.min(visibleUnits.length, 4) - 1 ? ' ' : ''}
          </Text>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.unitsRow}>
        {visibleUnits.map((u, i) => (
          <View key={i} style={styles.unitBlock}>
            <Text style={[styles.value, { color: accentColor }]}>
              {String(u.value).padStart(2, '0')}
            </Text>
            <Text style={styles.label}>{u.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  unitsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  unitBlock: {
    alignItems: 'center',
    minWidth: 40,
  },
  value: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,
  },
  label: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  compactText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
  },
  compactLabel: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
});
