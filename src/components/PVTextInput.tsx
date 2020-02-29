import React from 'react'
import { TextInput } from 'react-native'
import { getGlobal } from 'reactn'
import { PV } from '../resources'
import { core } from '../styles'

type Props = {
  autoCapitalize?: any
  autoCompleteType?: any
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  keyboardType?: any
  numberOfLines?: number
  onChangeText: any
  placeholder?: string
  returnKeyType?: any
  secureTextEntry?: boolean
  style?: any
  underlineColorAndroid?: any
  value?: string
}

export const PVTextInput = (props: Props) => {
  const {
    autoCapitalize,
    autoCompleteType,
    fontSizeLargerScale,
    fontSizeLargestScale,
    keyboardType,
    numberOfLines = 0,
    onChangeText,
    placeholder,
    returnKeyType = 'default',
    secureTextEntry,
    style,
    underlineColorAndroid,
    value
  } = props
  const { fontScaleMode, globalTheme } = getGlobal()

  const textInputStyle = []
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    textInputStyle.push({ fontSize: fontSizeLargerScale })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    textInputStyle.push({ fontSize: fontSizeLargestScale })
  }

  console.log('wtf', textInputStyle)

  return (
    <TextInput
      autoCapitalize={autoCapitalize}
      autoCompleteType={autoCompleteType}
      blurOnSubmit={returnKeyType === 'done'}
      keyboardType={keyboardType}
      multiline={numberOfLines > 0}
      numberOfLines={numberOfLines}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={globalTheme.placeholderText.color}
      returnKeyType={returnKeyType}
      secureTextEntry={secureTextEntry}
      style={[globalTheme.textInput, core.textInput, style, textInputStyle]}
      underlineColorAndroid={underlineColorAndroid}
      value={value}
    />
  )
}
