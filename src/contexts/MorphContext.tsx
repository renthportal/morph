import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Morph, MorphStats, PhotoSource } from '../types/morph';
import { MorphCategory } from '../constants/categories';
import { v4 as uuidv4 } from 'uuid';

const MORPHS_KEY = '@morph_data';

interface MorphContextType {
  morphs: Morph[];
  loading: boolean;
  stats: MorphStats;
  createMorph: (data: {
    title: string;
    note: string;
    category: MorphCategory;
    color: string;
    goal_date: string | null;
    is_ongoing: boolean;
    before_uri: string | null;
    before_taken_with: PhotoSource | null;
  }) => Promise<Morph>;
  updateMorph: (id: string, updates: Partial<Morph>) => Promise<void>;
  deleteMorph: (id: string) => Promise<void>;
  addAfterPhoto: (id: string, uri: string, takenWith: PhotoSource) => Promise<void>;
  getMorph: (id: string) => Morph | undefined;
  refreshMorphs: () => Promise<void>;
}

const MorphContext = createContext<MorphContextType>({} as MorphContextType);

export const useMorphs = () => useContext(MorphContext);

export function MorphProvider({ children }: { children: React.ReactNode }) {
  const [morphs, setMorphs] = useState<Morph[]>([]);
  const [loading, setLoading] = useState(true);

  const saveMorphs = async (data: Morph[]) => {
    await AsyncStorage.setItem(MORPHS_KEY, JSON.stringify(data));
  };

  const loadMorphs = async () => {
    try {
      const stored = await AsyncStorage.getItem(MORPHS_KEY);
      if (stored) {
        setMorphs(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load morphs', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMorphs();
  }, []);

  const stats: MorphStats = {
    total: morphs.length,
    ongoing: morphs.filter((m) => m.is_ongoing || !m.after_url).length,
    completed: morphs.filter((m) => !m.is_ongoing && m.after_url).length,
  };

  const createMorph = async (data: {
    title: string;
    note: string;
    category: MorphCategory;
    color: string;
    goal_date: string | null;
    is_ongoing: boolean;
    before_uri: string | null;
    before_taken_with: PhotoSource | null;
  }): Promise<Morph> => {
    const now = new Date().toISOString();
    const morph: Morph = {
      id: uuidv4(),
      user_id: 'local',
      title: data.title,
      note: data.note || null,
      category: data.category,
      color: data.color,
      before_url: data.before_uri,
      after_url: null,
      before_taken_with: data.before_taken_with,
      after_taken_with: null,
      before_date: now,
      after_date: null,
      goal_date: data.goal_date,
      is_verified: false,
      is_ongoing: data.is_ongoing,
      is_public: false,
      created_at: now,
      updated_at: now,
    };

    const updated = [morph, ...morphs];
    setMorphs(updated);
    await saveMorphs(updated);
    return morph;
  };

  const updateMorph = async (id: string, updates: Partial<Morph>) => {
    const updated = morphs.map((m) =>
      m.id === id ? { ...m, ...updates, updated_at: new Date().toISOString() } : m
    );
    setMorphs(updated);
    await saveMorphs(updated);
  };

  const deleteMorph = async (id: string) => {
    const updated = morphs.filter((m) => m.id !== id);
    setMorphs(updated);
    await saveMorphs(updated);
  };

  const addAfterPhoto = async (id: string, uri: string, takenWith: PhotoSource) => {
    const morph = morphs.find((m) => m.id === id);
    if (!morph) return;

    const isVerified = morph.before_taken_with === 'camera' && takenWith === 'camera';

    await updateMorph(id, {
      after_url: uri,
      after_taken_with: takenWith,
      after_date: new Date().toISOString(),
      is_verified: isVerified,
      is_ongoing: false,
    });
  };

  const getMorph = useCallback(
    (id: string) => morphs.find((m) => m.id === id),
    [morphs]
  );

  const refreshMorphs = async () => {
    await loadMorphs();
  };

  return (
    <MorphContext.Provider
      value={{
        morphs,
        loading,
        stats,
        createMorph,
        updateMorph,
        deleteMorph,
        addAfterPhoto,
        getMorph,
        refreshMorphs,
      }}
    >
      {children}
    </MorphContext.Provider>
  );
}
