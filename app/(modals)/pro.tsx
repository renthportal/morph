import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { usePro } from '../../src/contexts/ProContext';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../src/constants/theme';

type PlanType = 'monthly' | 'yearly';

interface ProFeature {
  titleKey: string;
  descKey: string;
  icon: string;
}

const PRO_FEATURES: ProFeature[] = [
  { titleKey: 'pro.features.watermark', descKey: 'pro.features.watermarkDesc', icon: '✨' },
  { titleKey: 'pro.features.templates', descKey: 'pro.features.templatesDesc', icon: '🎨' },
  { titleKey: 'pro.features.progress', descKey: 'pro.features.progressDesc', icon: '📸' },
  { titleKey: 'pro.features.video', descKey: 'pro.features.videoDesc', icon: '🎬' },
  { titleKey: 'pro.features.stats', descKey: 'pro.features.statsDesc', icon: '📊' },
];

export default function ProScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setPro } = usePro();
  const [plan, setPlan] = useState<PlanType>('yearly');

  const handleSubscribe = () => {
    // In production, this would trigger IAP
    setPro(true);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.proLogo}>MORPH</Text>
            <Text style={styles.proLabel}>PRO</Text>
            <Text style={styles.subtitle}>{t('pro.subtitle')}</Text>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            {PRO_FEATURES.map((feature, i) => (
              <View key={i} style={styles.featureRow}>
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <View style={styles.featureText}>
                  <Text style={styles.featureTitle}>{t(feature.titleKey)}</Text>
                  <Text style={styles.featureDesc}>{t(feature.descKey)}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Plan Toggle */}
          <View style={styles.planSection}>
            <TouchableOpacity
              style={[styles.planCard, plan === 'monthly' && styles.planCardActive]}
              onPress={() => setPlan('monthly')}
            >
              <View style={styles.planHeader}>
                <View style={[styles.planRadio, plan === 'monthly' && styles.planRadioActive]}>
                  {plan === 'monthly' && <View style={styles.planRadioDot} />}
                </View>
                <Text style={styles.planPrice}>{t('pro.monthly')}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planCard, plan === 'yearly' && styles.planCardActive]}
              onPress={() => setPlan('yearly')}
            >
              <View style={styles.planHeader}>
                <View style={[styles.planRadio, plan === 'yearly' && styles.planRadioActive]}>
                  {plan === 'yearly' && <View style={styles.planRadioDot} />}
                </View>
                <Text style={styles.planPrice}>{t('pro.yearly')}</Text>
                <View style={styles.saveBadge}>
                  <Text style={styles.saveBadgeText}>{t('pro.yearlySave')}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Grandfathered Note */}
          <Text style={styles.grandfathered}>{t('pro.grandfathered')}</Text>
        </ScrollView>

        {/* Bottom CTA */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.ctaBtn} onPress={handleSubscribe}>
            <Text style={styles.ctaBtnText}>{t('pro.trial')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.restoreBtn}>
            <Text style={styles.restoreBtnText}>{t('pro.restore')}</Text>
          </TouchableOpacity>
        </View>
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    color: Colors.text,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  proLogo: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxxl,
    color: Colors.primary,
    letterSpacing: 4,
  },
  proLabel: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: Colors.secondary,
    letterSpacing: 6,
    marginTop: -4,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.md,
  },
  featureIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  featureDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
    marginTop: 2,
  },
  planSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  planCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  planRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.textMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planRadioActive: {
    borderColor: Colors.primary,
  },
  planRadioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  planPrice: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
    flex: 1,
  },
  saveBadge: {
    backgroundColor: Colors.success + '20',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  saveBadgeText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.success,
  },
  grandfathered: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  ctaBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ctaBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: 'white',
  },
  restoreBtn: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  restoreBtnText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
});
