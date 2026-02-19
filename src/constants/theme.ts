export const Colors = {
  primary: '#E8634A',
  secondary: '#C4A882',
  background: '#0B0B0B',
  surface: '#141414',
  card: '#1C1B19',
  text: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#666666',
  border: '#2A2A2A',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  verified: '#FFD700',
};

export const AccentColors = [
  '#E8634A', // Primary orange-red
  '#C4A882', // Secondary warm beige
  '#4ECDC4', // Teal
  '#FF6B9D', // Pink
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Lavender
  '#FCE38A', // Yellow
] as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FontFamily = {
  headingRegular: 'PlayfairDisplay_400Regular',
  headingMedium: 'PlayfairDisplay_500Medium',
  headingBold: 'PlayfairDisplay_700Bold',
  bodyRegular: 'Outfit_400Regular',
  bodyMedium: 'Outfit_500Medium',
  bodySemiBold: 'Outfit_600SemiBold',
  bodyBold: 'Outfit_700Bold',
} as const;

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 28,
  xxxl: 36,
} as const;
