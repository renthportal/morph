import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMorphs } from '../../src/contexts/MorphContext';
import { BeforeAfterSlider } from '../../src/components/BeforeAfterSlider';
import { TimerDisplay } from '../../src/components/TimerDisplay';
import { MilestoneBar } from '../../src/components/MilestoneBar';
import { getCategoryInfo } from '../../src/constants/categories';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

export default function MorphDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { getMorph, deleteMorph } = useMorphs();

  const morph = getMorph(id);

  if (!morph) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Morph not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const categoryInfo = getCategoryInfo(morph.category);
  const isCompleted = !morph.is_ongoing && morph.after_url;

  const handleDelete = () => {
    Alert.alert(t('detail.deleteTitle'), t('detail.deleteConfirm'), [
      { text: t('detail.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await deleteMorph(morph.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={styles.deleteText}>{t('detail.delete')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.emoji}>{categoryInfo.icon}</Text>
          <Text style={styles.title}>{morph.title}</Text>
          <View style={styles.badgeRow}>
            {morph.is_verified && (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedIcon}>✓</Text>
                <Text style={styles.verifiedText}>{t('detail.verified')}</Text>
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
                {isCompleted ? t('detail.completed') : t('detail.ongoing')}
              </Text>
            </View>
          </View>
        </View>

        {/* Note */}
        {morph.note && (
          <View style={styles.noteSection}>
            <Text style={styles.noteText}>{morph.note}</Text>
          </View>
        )}

        {/* Before/After Slider */}
        <View style={styles.sliderSection}>
          <BeforeAfterSlider beforeUri={morph.before_url} afterUri={morph.after_url} />
        </View>

        {/* Timer */}
        <View style={styles.timerSection}>
          <Text style={styles.timerLabel}>
            {morph.after_date
              ? t('detail.elapsed')
              : morph.goal_date
              ? t('detail.remaining')
              : t('detail.elapsed')}
          </Text>
          <TimerDisplay
            startDate={morph.before_date}
            endDate={morph.after_date}
            goalDate={morph.goal_date}
            accentColor={morph.color}
          />
        </View>

        {/* Milestones */}
        {morph.goal_date && (
          <View style={styles.milestonesSection}>
            <Text style={styles.sectionLabel}>{t('detail.milestones')}</Text>
            <MilestoneBar
              startDate={morph.before_date}
              goalDate={morph.goal_date}
              afterDate={morph.after_date}
              accentColor={morph.color}
            />
          </View>
        )}

        {/* Verified Info */}
        {morph.is_verified && (
          <View style={styles.verifiedSection}>
            <Text style={styles.verifiedSectionIcon}>✓</Text>
            <View>
              <Text style={styles.verifiedSectionTitle}>{t('detail.verified')}</Text>
              <Text style={styles.verifiedSectionDesc}>{t('detail.verifiedDesc')}</Text>
              <Text style={styles.verifiedDate}>
                {new Date(morph.before_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomBar}>
        {!morph.after_url && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: morph.color }]}
            onPress={() => router.push(`/morph/add-after/${morph.id}`)}
          >
            <Text style={styles.actionBtnText}>{t('detail.addAfterPhoto')}</Text>
          </TouchableOpacity>
        )}
        {morph.after_url && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: morph.color }]}
            onPress={() => router.push(`/morph/export/${morph.id}`)}
          >
            <Text style={styles.actionBtnText}>{t('detail.export')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textMuted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: 24,
    color: Colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  deleteText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.error,
  },
  titleSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  emoji: {
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxxl,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.verified + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  verifiedIcon: {
    color: Colors.verified,
    fontFamily: FontFamily.bodyBold,
    fontSize: 12,
  },
  verifiedText: {
    color: Colors.verified,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
  },
  noteSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  noteText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sliderSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  timerSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  timerLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  milestonesSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  verifiedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.verified + '10',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.verified + '30',
    gap: Spacing.md,
  },
  verifiedSectionIcon: {
    fontSize: 24,
    color: Colors.verified,
  },
  verifiedSectionTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.verified,
  },
  verifiedSectionDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  verifiedDate: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  actionBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  actionBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: 'white',
  },
});
