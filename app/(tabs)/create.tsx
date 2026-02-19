import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useMorphs } from '../../src/contexts/MorphContext';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius, AccentColors } from '../../src/constants/theme';
import { CATEGORIES, MorphCategory } from '../../src/constants/categories';
import { MorphDraft, PhotoSource } from '../../src/types/morph';
import { scheduleMilestoneNotifications } from '../../src/services/notifications';

const TOTAL_STEPS = 3;

export default function CreateScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { createMorph } = useMorphs();

  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<MorphDraft>({
    title: '',
    note: '',
    category: null,
    color: AccentColors[0],
    goal_date: null,
    is_ongoing: true,
    before_uri: null,
    before_taken_with: null,
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraRef, setCameraRef] = useState<any>(null);

  // Lazy-load native-only modules
  const isWeb = Platform.OS === 'web';

  const canGoNext = () => {
    if (step === 1) return draft.title.trim().length > 0;
    if (step === 2) return true; // photo is optional
    if (step === 3) return draft.category !== null;
    return false;
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCamera = async () => {
    if (isWeb) {
      // On web, use image picker with camera option
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setDraft({ ...draft, before_uri: result.assets[0].uri, before_taken_with: 'camera' as PhotoSource });
      }
      return;
    }
    try {
      const { CameraView: CV, useCameraPermissions: uCP } = require('expo-camera');
      setShowCamera(true);
    } catch {
      Alert.alert('Camera not available');
    }
  };

  const handleTakePhoto = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setDraft({ ...draft, before_uri: photo.uri, before_taken_with: 'camera' as PhotoSource });
      setShowCamera(false);
    }
  };

  const handleGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDraft({ ...draft, before_uri: result.assets[0].uri, before_taken_with: 'gallery' as PhotoSource });
    }
  };

  const handleCreate = async () => {
    if (!draft.category) return;

    const morph = await createMorph({
      title: draft.title,
      note: draft.note,
      category: draft.category,
      color: draft.color,
      goal_date: draft.goal_date ? draft.goal_date.toISOString() : null,
      is_ongoing: draft.is_ongoing,
      before_uri: draft.before_uri,
      before_taken_with: draft.before_taken_with,
    });

    // Schedule notifications if goal date is set
    if (draft.goal_date) {
      await scheduleMilestoneNotifications(
        morph.id,
        morph.title,
        draft.category,
        new Date(),
        draft.goal_date
      );
    }

    // Reset form
    setDraft({
      title: '',
      note: '',
      category: null,
      color: AccentColors[0],
      goal_date: null,
      is_ongoing: true,
      before_uri: null,
      before_taken_with: null,
    });
    setStep(1);
    router.push('/(tabs)');
  };

  if (showCamera && !isWeb) {
    const { CameraView } = require('expo-camera');
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          ref={(ref: any) => setCameraRef(ref)}
          style={styles.camera}
          facing="back"
        >
          <SafeAreaView style={styles.cameraOverlay}>
            <TouchableOpacity
              style={styles.cameraClose}
              onPress={() => setShowCamera(false)}
            >
              <Text style={styles.cameraCloseText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.cameraBottom}>
              <TouchableOpacity style={styles.captureBtn} onPress={handleTakePhoto}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('create.title')}</Text>
          <Text style={styles.stepIndicator}>
            {t('create.step', { current: step, total: TOTAL_STEPS })}
          </Text>
        </View>

        {/* Step Progress */}
        <View style={styles.progressRow}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && { backgroundColor: Colors.primary },
              ]}
            />
          ))}
        </View>

        {/* Step 1: Title, Note, Dates, Color */}
        {step === 1 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('create.stepTitle')}</Text>

            <Text style={styles.inputLabel}>{t('create.titleLabel')}</Text>
            <TextInput
              style={styles.input}
              placeholder={t('create.titlePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={draft.title}
              onChangeText={(text) => setDraft({ ...draft, title: text })}
            />

            <Text style={styles.inputLabel}>{t('create.noteLabel')}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t('create.notePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={draft.note}
              onChangeText={(text) => setDraft({ ...draft, note: text })}
              multiline
              numberOfLines={3}
            />

            {/* Ongoing Toggle */}
            <TouchableOpacity
              style={[styles.toggleRow, draft.is_ongoing && styles.toggleActive]}
              onPress={() => setDraft({ ...draft, is_ongoing: !draft.is_ongoing, goal_date: null })}
            >
              <View>
                <Text style={styles.toggleLabel}>{t('create.ongoing')}</Text>
                <Text style={styles.toggleDesc}>{t('create.ongoingDesc')}</Text>
              </View>
              <View style={[styles.toggle, draft.is_ongoing && styles.toggleOn]}>
                <View style={[styles.toggleDot, draft.is_ongoing && styles.toggleDotOn]} />
              </View>
            </TouchableOpacity>

            {/* Goal Date */}
            {!draft.is_ongoing && (
              <View>
                <Text style={styles.inputLabel}>{t('create.goalDate')}</Text>
                {isWeb ? (
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.textMuted}
                    value={draft.goal_date ? draft.goal_date.toISOString().split('T')[0] : ''}
                    onChangeText={(text) => {
                      const date = new Date(text);
                      if (!isNaN(date.getTime())) {
                        setDraft({ ...draft, goal_date: date });
                      }
                    }}
                  />
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <Text style={styles.dateButtonText}>
                        {draft.goal_date
                          ? draft.goal_date.toLocaleDateString()
                          : t('create.noGoalDate')}
                      </Text>
                    </TouchableOpacity>
                    {showDatePicker && (() => {
                      const DateTimePicker = require('@react-native-community/datetimepicker').default;
                      return (
                        <DateTimePicker
                          value={draft.goal_date || new Date()}
                          mode="date"
                          minimumDate={new Date()}
                          onChange={(_: any, date: Date | undefined) => {
                            setShowDatePicker(Platform.OS === 'ios');
                            if (date) setDraft({ ...draft, goal_date: date });
                          }}
                          themeVariant="dark"
                        />
                      );
                    })()}
                  </>
                )}
              </View>
            )}

            {/* Accent Color */}
            <Text style={styles.inputLabel}>{t('create.accentColor')}</Text>
            <View style={styles.colorsRow}>
              {AccentColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    draft.color === color && styles.colorSwatchSelected,
                  ]}
                  onPress={() => setDraft({ ...draft, color })}
                />
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Before Photo */}
        {step === 2 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('create.stepPhoto')}</Text>

            {draft.before_uri ? (
              <View style={styles.photoPreview}>
                <Image source={{ uri: draft.before_uri }} style={styles.previewImage} />
                <View style={styles.photoSourceBadge}>
                  <Text style={styles.photoSourceText}>
                    {draft.before_taken_with === 'camera' ? '📷 Camera' : '🖼 Gallery'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() => setDraft({ ...draft, before_uri: null, before_taken_with: null })}
                >
                  <Text style={styles.removePhotoText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoOptions}>
                <TouchableOpacity style={styles.photoOption} onPress={handleCamera}>
                  <Text style={styles.photoOptionIcon}>📷</Text>
                  <Text style={styles.photoOptionText}>{t('create.camera')}</Text>
                  <Text style={styles.photoOptionHint}>{t('create.cameraVerified')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoOption} onPress={handleGallery}>
                  <Text style={styles.photoOptionIcon}>🖼</Text>
                  <Text style={styles.photoOptionText}>{t('create.gallery')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Step 3: Category */}
        {step === 3 && (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{t('create.stepCategory')}</Text>

            <View style={styles.categoriesGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.key}
                  style={[
                    styles.categoryCard,
                    draft.category === cat.key && {
                      borderColor: cat.color,
                      backgroundColor: cat.color + '15',
                    },
                  ]}
                  onPress={() => setDraft({ ...draft, category: cat.key })}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      draft.category === cat.key && { color: cat.color },
                    ]}
                  >
                    {cat.key.charAt(0).toUpperCase() + cat.key.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        {step > 1 && (
          <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
            <Text style={styles.backBtnText}>{t('create.back')}</Text>
          </TouchableOpacity>
        )}
        <View style={{ flex: 1 }} />
        {step < TOTAL_STEPS ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canGoNext() && styles.btnDisabled]}
            onPress={handleNext}
            disabled={!canGoNext()}
          >
            <Text style={styles.nextBtnText}>{t('create.next')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, styles.doneBtn, !canGoNext() && styles.btnDisabled]}
            onPress={handleCreate}
            disabled={!canGoNext()}
          >
            <Text style={styles.nextBtnText}>{t('create.done')}</Text>
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  stepIndicator: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
    color: Colors.textMuted,
  },
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
  },
  stepContent: {
    paddingHorizontal: Spacing.lg,
  },
  stepTitle: {
    fontFamily: FontFamily.headingMedium,
    fontSize: FontSize.xl,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleActive: {
    borderColor: Colors.primary + '50',
  },
  toggleLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  toggleDesc: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.textMuted,
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.border,
    padding: 2,
  },
  toggleOn: {
    backgroundColor: Colors.primary,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleDotOn: {
    alignSelf: 'flex-end',
  },
  dateButton: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateButtonText: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  colorsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorSwatchSelected: {
    borderWidth: 3,
    borderColor: 'white',
    transform: [{ scale: 1.1 }],
  },
  photoOptions: {
    gap: Spacing.md,
  },
  photoOption: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  photoOptionIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  photoOptionText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  photoOptionHint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.verified,
    marginTop: Spacing.xs,
  },
  photoPreview: {
    position: 'relative',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: BorderRadius.lg,
  },
  photoSourceBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  photoSourceText: {
    color: 'white',
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
  },
  removePhoto: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: 'white',
    fontSize: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: Spacing.sm,
  },
  categoryLabel: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
  },
  backBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: Colors.text,
  },
  nextBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary,
  },
  doneBtn: {
    backgroundColor: Colors.success,
  },
  nextBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: 'white',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cameraClose: {
    alignSelf: 'flex-end',
    padding: Spacing.md,
    margin: Spacing.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: BorderRadius.full,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraCloseText: {
    color: 'white',
    fontSize: 20,
  },
  cameraBottom: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureBtnInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: 'white',
  },
});
