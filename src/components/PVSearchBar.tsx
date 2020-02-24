import React from 'react'
import { SearchBar } from 'react-native-elements'
import { useGlobal } from 'reactn'

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
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <SearchBar
      autoCorrect={false}
      clearIcon={true}
      containerStyle={[globalTheme.textInputWrapper, containerStyle]}
      inputContainerStyle={[
        globalTheme.inputContainerText,
        inputContainerStyle
      ]}
      onChangeText={onChangeText}
      onClear={onClear}
      placeholder={placeholder}
      returnKeyType='done'
      searchIcon={true}
      style={globalTheme.textInput}
      value={value}
    />
  )
}
