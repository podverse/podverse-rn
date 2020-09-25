import React from 'react'
import { TextInput } from 'react-native'
import { useGlobal } from 'reactn'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { core } from '../styles'

type Props = {
  autoCapitalize?: any
  autoCompleteType?: any
  autoCorrect?: boolean
  editable?: boolean
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  inputRef?: any
  keyboardType?: any
  numberOfLines?: number
  onBlur?: any
  onChange?: any
  onChangeText?: any
  onSubmitEditing?: any
  placeholder?: string
  placeholderTextColor?: string
  returnKeyType?: any
  secureTextEntry?: boolean
  style?: any
  testID?: string
  underlineColorAndroid?: any
  value?: string
}

export const PVTextInput = (props: Props) => {
  const {
    autoCapitalize,
    autoCompleteType,
    autoCorrect,
    editable = true,
    fontSizeLargerScale,
    fontSizeLargestScale,
    inputRef,
    keyboardType,
    numberOfLines = 1,
    onBlur,
    onChange,
    onChangeText,
    onSubmitEditing,
    placeholder,
    placeholderTextColor,
    returnKeyType = 'default',
    secureTextEntry,
    style,
    underlineColorAndroid,
    testID,
    value
  } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const textInputStyle = []
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    textInputStyle.push({ fontSize: fontSizeLargerScale })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    textInputStyle.push({ fontSize: fontSizeLargestScale })
  }
  if (numberOfLines > 1) {
    textInputStyle.push({ textAlignVertical: 'top' })
  }

  return (
    <TextInput
      autoCapitalize={autoCapitalize}
      autoCompleteType={autoCompleteType}
      autoCorrect={autoCorrect}
      blurOnSubmit={returnKeyType === 'done'}
      editable={editable}
      keyboardType={keyboardType}
      multiline={numberOfLines > 1}
      numberOfLines={numberOfLines}
      onBlur={onBlur}
      onChange={onChange}
      onChangeText={onChangeText}
      onSubmitEditing={onSubmitEditing}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor || globalTheme.placeholderText.color}
      ref={inputRef}
      returnKeyType={returnKeyType}
      secureTextEntry={secureTextEntry}
      style={[globalTheme.textInput, core.textInput, style, textInputStyle]}
      underlineColorAndroid={underlineColorAndroid}
      {...(testID ? testProps(`${testID}_text_input`) : {})}
      value={value}
    />
  )
}
