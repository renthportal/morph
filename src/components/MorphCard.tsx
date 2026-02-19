import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Morph } from '../types/morph';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../constants/theme';
import { getCategoryInfo } from '../constants/categories';
import { useTimer, formatTimeCompact } from '../hooks/useTimer';

interface MorphCardProps {
  morph: Morph;
}

export function MorphCard({ morph }: MorphCardProps) {
  const router = useRouter();
  const timer = useTimer(morph.before_date, morph.after_date, morph.goal_date);
  const categoryInfo = getCategoryInfo(morph.category);
  const isCompleted = !morph.is_ongoing && morph.after_url;

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: morph.color }]}
      onPress={() => router.push(`/morph/${morph.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.emoji}>{categoryInfo.icon}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {morph.title}
          </Text>
        </View>
        <View style={styles.badges}>
          {morph.is_verified && (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>✓</Text>
            </View>
          )}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isCompleted ? Colors.success + '20' : morph.color + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: isCompleted ? Colors.success : morph.color },
              ]}
            >
              {isCompleted ? 'Done' : 'Active'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.photoRow}>
        {morph.before_url ? (
          <Image source={{ uri: morph.before_url }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumb]}>
            <Text style={styles.placeholderText}>B</Text>
          </View>
        )}
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
        {morph.after_url ? (
          <Image source={{ uri: morph.after_url }} style={styles.thumbnail} />
        ) : (
          <View style={[styles.thumbnail, styles.placeholderThumb]}>
            <Text style={styles.placeholderText}>?</Text>
          </View>
        )}
      </View>

      <View style={styles.timerRow}>
        <Text style={styles.timerLabel}>
          {morph.after_date ? '⏱' : timer.isCountingUp ? '⏱' : '⏳'}
        </Text>
        <Text style={[styles.timerValue, { color: morph.color }]}>
          {formatTimeCompact(timer)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 18,
    marginRight: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  verifiedBadge: {
    backgroundColor: Colors.verified + '20',
    borderRadius: BorderRadius.full,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedText: {
    color: Colors.verified,
    fontSize: 12,
    fontFamily: FontFamily.bodyBold,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  thumbnail: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.sm,
  },
  placeholderThumb: {
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: Colors.textMuted,
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.md,
  },
  arrow: {
    marginHorizontal: Spacing.sm,
  },
  arrowText: {
    color: Colors.textMuted,
    fontSize: 18,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerLabel: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  timerValue: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
  },
});
