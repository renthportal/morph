import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useMorphs } from '../../../src/contexts/MorphContext';
import { Colors, FontFamily, FontSize, Spacing, BorderRadius } from '../../../src/constants/theme';
import { PhotoSource } from '../../../src/types/morph';

const isWeb = Platform.OS === 'web';

export default function AddAfterPhotoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const router = useRouter();
  const { getMorph, addAfterPhoto } = useMorphs();

  const [showCamera, setShowCamera] = useState(false);
  const [cameraRef, setCameraRef] = useState<any>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoSource, setPhotoSource] = useState<PhotoSource | null>(null);

  const morph = getMorph(id);

  if (!morph) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFoundText}>Morph not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleCamera = async () => {
    if (isWeb) {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setPhotoSource('camera');
      }
      return;
    }
    setShowCamera(true);
  };

  const handleTakePhoto = async () => {
    if (cameraRef) {
      const photo = await cameraRef.takePictureAsync();
      setPhotoUri(photo.uri);
      setPhotoSource('camera');
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
      setPhotoUri(result.assets[0].uri);
      setPhotoSource('gallery');
    }
  };

  const handleSave = async () => {
    if (photoUri && photoSource) {
      await addAfterPhoto(morph.id, photoUri, photoSource);
      router.back();
    }
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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{t('addAfter.title')}</Text>
          <Text style={styles.subtitle}>{t('addAfter.subtitle')}</Text>
          <Text style={styles.morphTitle}>{morph.title}</Text>

          {photoUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: photoUri }} style={styles.preview} />
              <View style={styles.sourceBadge}>
                <Text style={styles.sourceText}>
                  {photoSource === 'camera' ? '📷 Camera' : '🖼 Gallery'}
                </Text>
              </View>
              {morph.before_taken_with === 'camera' && photoSource === 'camera' && (
                <View style={styles.verifiedHint}>
                  <Text style={styles.verifiedHintText}>✓ Will be Verified!</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.retakeBtn}
                onPress={() => {
                  setPhotoUri(null);
                  setPhotoSource(null);
                }}
              >
                <Text style={styles.retakeBtnText}>Retake</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.options}>
              <TouchableOpacity style={styles.option} onPress={handleCamera}>
                <Text style={styles.optionIcon}>📷</Text>
                <Text style={styles.optionText}>{t('addAfter.camera')}</Text>
                <Text style={styles.optionHint}>{t('addAfter.cameraVerified')}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option} onPress={handleGallery}>
                <Text style={styles.optionIcon}>🖼</Text>
                <Text style={styles.optionText}>{t('addAfter.gallery')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {photoUri && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: morph.color }]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    color: Colors.textMuted,
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
  },
  header: {
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
    fontSize: 18,
    color: Colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  title: {
    fontFamily: FontFamily.headingBold,
    fontSize: FontSize.xxl,
    color: Colors.text,
  },
  subtitle: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  morphTitle: {
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.lg,
    color: Colors.primary,
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  options: {
    gap: Spacing.md,
  },
  option: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  optionIcon: {
    fontSize: 40,
    marginBottom: Spacing.sm,
  },
  optionText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.lg,
    color: Colors.text,
  },
  optionHint: {
    fontFamily: FontFamily.bodyRegular,
    fontSize: FontSize.xs,
    color: Colors.verified,
    marginTop: Spacing.xs,
  },
  previewContainer: {
    position: 'relative',
  },
  preview: {
    width: '100%',
    height: 350,
    borderRadius: BorderRadius.lg,
  },
  sourceBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  sourceText: {
    color: 'white',
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.xs,
  },
  verifiedHint: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.verified + '30',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  verifiedHintText: {
    color: Colors.verified,
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.xs,
  },
  retakeBtn: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  retakeBtnText: {
    color: 'white',
    fontFamily: FontFamily.bodyMedium,
    fontSize: FontSize.sm,
  },
  bottomBar: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: FontFamily.bodySemiBold,
    fontSize: FontSize.md,
    color: 'white',
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
