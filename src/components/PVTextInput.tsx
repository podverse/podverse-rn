import React from 'react'
import { TextInput } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  autoCapitalize?: any
  keyboardType?: any
  onChangeText: any
  placeholder?: string
  secureTextEntry?: boolean
  style?: any
  underlineColorAndroid?: any
  value?: string
}

export const PVTextInput = (props: Props) => {
  const { autoCapitalize, keyboardType, onChangeText, placeholder, secureTextEntry, style,
    underlineColorAndroid, value } = props
  const [globalTheme] = useGlobal('globalTheme')
  return (
    <TextInput
      autoCapitalize={autoCapitalize}
      keyboardType={keyboardType}
      onChangeText={onChangeText}
      placeholder={placeholder}
      secureTextEntry={secureTextEntry}
      style={[style, globalTheme.textInput]}
      underlineColorAndroid={underlineColorAndroid}
      value={value} />
  )
}
