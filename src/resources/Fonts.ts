import { Platform } from 'react-native'
import { IFonts } from './Interfaces'

const sizes = Platform.OS === 'android' ?
({
  tiny: 12,
  xs: 13,
  sm: 14,
  md: 16,
  lg: 17,
  xl: 18
}) :
({
  tiny: 13,
  xs: 14,
  sm: 15,
  md: 17,
  lg: 18,
  xl: 19
})

export const Fonts: IFonts = {
  sizes,
  weights: {
    thin: '300',
    normal: '400',
    semibold: '500',
    bold: '600',
    extraBold: '700'
  },
  fontScale: {
    larger: 'larger',
    largest: 'largest'
  }
}

export const determineFontScaleMode = (fontScale: number) => {
  if (fontScale > 1 && fontScale < 2) {
    return Fonts.fontScale.larger
  } else if (fontScale >= 2) {
    return Fonts.fontScale.largest
  } else {
    return null
  }
}
