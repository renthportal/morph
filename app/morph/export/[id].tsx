import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as Sharing from 'expo-sharing';
import { useMorphs } from '../../../src/contexts/MorphContext';
import { usePro } from '../../../src/contexts/ProContext';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../../src/constants/theme';
import { useTimer, formatTimeCompact } from '../../../src/hooks/useTimer';

type ExportFormat = 'square' | 'story' | 'landscape';

const FORMAT_RATIOS: Record<ExportFormat, { width: number; height: number }> = {
  square: { width: 300, height: 300 },
  story: { width: 270, height: 480 },
  landscape: { width: 400, height: 225 },
};

export default function ExportScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { getMorph } = useMorphs();
  const { isPro } = usePro();

  const morph = getMorph(id);
  const [format, setFormat] = useState<ExportFormat>('square');

  const timer = useTimer(
    morph?.before_date ?? '',
    morph?.after_date,
    morph?.goal_date
  );

  if (!morph) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFoundText}>Morph not found</Text>
      </SafeAreaView>
    );
  }

  const formatOptions: { key: ExportFormat; label: string }[] = [
    { key: 'square', label: t('export.square') },
    { key: 'story', label: t('export.story') },
    { key: 'landscape', label: t('export.landscape') },
  ];

  const handleShare = async () => {
    // In a real app, we'd generate the export image here
    // For now, share the after photo if available
    const photoUri = morph.after_url || morph.before_url;
    if (photoUri) {
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(photoUri);
      } else {
        Alert.alert('Sharing not available');
      }
    }
  };

  const ratio = FORMAT_RATIOS[format];
  const previewHeight = (ratio.height / ratio.width) * 280;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('export.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Preview */}
          <View style={styles.previewSection}>
            <Text style={styles.sectionLabel}>{t('export.preview')}</Text>
            <View style={[styles.previewCard, { height: previewHeight }]}>
              <View style={styles.previewPhotos}>
                {morph.before_url && (
                  <Image
                    source={{ uri: morph.before_url }}
                    style={styles.previewPhoto}
                    resizeMode="cover"
                  />
                )}
                {morph.after_url && (
                  <Image
                    source={{ uri: morph.after_url }}
                    style={styles.previewPhoto}
                    resizeMode="cover"
                  />
                )}
              </View>

              <View style={styles.previewOverlay}>
                <Text style={styles.previewTitle}>{morph.title}</Text>
                <Text style={[styles.previewTime, { color: morph.color }]}>
                  {formatTimeCompact(timer)}
                </Text>
                {morph.is_verified && (
                  <Text style={styles.previewVerified}>
                    ✓ Verified by MORPH — {new Date(morph.before_date).toLocaleDateString()}
                  </Text>
                )}
              </View>

              {!isPro && (
                <View style={styles.watermark}>
                  <Text style={styles.watermarkText}>{t('export.watermark')}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Format Selector */}
          <View style={styles.formatSection}>
            <Text style={styles.sectionLabel}>{t('export.format')}</Text>
            <View style={styles.formatRow}>
              {formatOptions.map((f) => (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.formatBtn,
                    format === f.key && styles.formatBtnActive,
                  ]}
                  onPress={() => setFormat(f.key)}
                >
                  <Text
                    style={[
                      styles.formatBtnText,
                      format === f.key && styles.formatBtnTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* PRO hint */}
          {!isPro && (
            <TouchableOpacity
              style={styles.proHint}
              onPress={() => router.push('/(modals)/pro')}
            >
              <Text style={styles.proHintText}>{t('export.proRequired')}</Text>
              <Text style={styles.proHintArrow}>›</Text>
            </TouchableOpacity>
          )}

          {/* Share Options */}
          <View style={styles.shareSection}>
            <Text style={styles.sectionLabel}>{t('export.share')}</Text>
            <View style={styles.shareRow}>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <Text style={styles.shareBtnIcon}>📸</Text>
                <Text style={styles.shareBtnText}>{t('export.shareInstagram')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <Text style={styles.shareBtnIcon}>🎵</Text>
                <Text style={styles.shareBtnText}>{t('export.shareTikTok')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
                <Text style={styles.shareBtnIcon}>📤</Text>
                <Text style={styles.shareBtnText}>{t('export.shareOther')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={{ height: 80 }} />
        </ScrollView>

        {/* Save Button */}
        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} onPress={handleShare}>
            <Text style={styles.saveBtnText}>{t('export.save')}</Text>
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
  notFoundText: {
    color: Colors.textMuted,
    fontFamily: FontFamily.bodyRegular,
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  headerTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xl,
    color: Colors.text,
  },
  previewSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  previewCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  previewPhotos: {
    flex: 1,
    flexDirection: 'row',
  },
  previewPhoto: {
    flex: 1,
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  previewTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.md,
    color: 'white',
  },
  previewTime: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  previewVerified: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.verified,
    marginTop: 4,
  },
  watermark: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  watermarkText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: 9,
    color: 'rgba(255,255,255,0.6)',
  },
  formatSection: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  formatRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  formatBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formatBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  formatBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
  },
  formatBtnTextActive: {
    color: Colors.primary,
  },
  proHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary + '15',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  proHintText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.primary,
    flex: 1,
  },
  proHintArrow: {
    fontSize: 20,
    color: Colors.primary,
  },
  shareSection: {
    paddingHorizontal: Spacing.lg,
  },
  shareRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shareBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareBtnIcon: {
    fontSize: 24,
    marginBottom: Spacing.xs,
  },
  shareBtnText: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
    color: Colors.text,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: 'white',
  },
});
