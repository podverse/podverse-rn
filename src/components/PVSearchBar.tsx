import React from 'react'
import { SearchBar } from 'react-native-elements'
import { getGlobal } from 'reactn'
import { PV } from '../resources'

type Props = {
  containerStyle?: any
  inputContainerStyle?: any
  onChangeText: any
  onClear: any
  placeholder?: string
  value?: string
}

export const PVSearchBar = (props: Props) => {
  const {
    containerStyle,
    inputContainerStyle,
    onChangeText,
    onClear,
    placeholder,
    value
  } = props
  const { fontScaleMode, globalTheme } = getGlobal()
  return (
    <SearchBar
      autoCorrect={false}
      clearIcon={{ size: 24 }}
      containerStyle={[globalTheme.textInputWrapper, containerStyle]}
      inputContainerStyle={[
        globalTheme.inputContainerText,
        inputContainerStyle
      ]}
      inputStyle={PV.Fonts.fontScale.largest === fontScaleMode ? { fontSize: 12 } : {}}
      onChangeText={onChangeText}
      onClear={onClear}
      placeholder={placeholder}
      returnKeyType='done'
      searchIcon={{ size: 24 }}
      style={globalTheme.textInput}
      value={value}
    />
  )
}
