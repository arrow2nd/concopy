// Orange theme harmonious color palette for function backgrounds
export const colorPalette = [
  // Orange family
  { bg: '#E91E63', text: '#FFFFFF' }, // Pink-red
  { bg: '#FF5722', text: '#FFFFFF' }, // Deep orange
  { bg: '#FF9800', text: '#FFFFFF' }, // Orange
  { bg: '#FFC107', text: '#000000' }, // Amber
  { bg: '#FFEB3B', text: '#000000' }, // Yellow
  
  // Complementary blues
  { bg: '#2196F3', text: '#FFFFFF' }, // Blue
  { bg: '#03A9F4', text: '#FFFFFF' }, // Light blue
  { bg: '#00BCD4', text: '#FFFFFF' }, // Cyan
  { bg: '#009688', text: '#FFFFFF' }, // Teal
  
  // Harmonious greens
  { bg: '#4CAF50', text: '#FFFFFF' }, // Green
  { bg: '#8BC34A', text: '#FFFFFF' }, // Light green
  { bg: '#CDDC39', text: '#000000' }, // Lime
  
  // Purple/violet (triadic)
  { bg: '#9C27B0', text: '#FFFFFF' }, // Purple
  { bg: '#673AB7', text: '#FFFFFF' }, // Deep purple
  { bg: '#3F51B5', text: '#FFFFFF' }, // Indigo
  
  // Neutral with orange accent
  { bg: '#607D8B', text: '#FFFFFF' }, // Blue grey
  { bg: '#795548', text: '#FFFFFF' }, // Brown
  { bg: '#9E9E9E', text: '#FFFFFF' }, // Grey
  { bg: '#455A64', text: '#FFFFFF' }, // Dark blue grey
  
  // Warm tones
  { bg: '#FF6F00', text: '#FFFFFF' }, // Orange accent
  { bg: '#F57C00', text: '#FFFFFF' }, // Orange 800
  { bg: '#E65100', text: '#FFFFFF' }, // Orange 900
  { bg: '#BF360C', text: '#FFFFFF' }, // Deep orange 900
]

export function getRandomColor() {
  const randomIndex = Math.floor(Math.random() * colorPalette.length)
  return colorPalette[randomIndex]
}

export function getContrastingTextColor(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '')
  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)
  
  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  
  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}