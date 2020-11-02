import React from 'react'
import { SearchBar } from 'react-native-elements'
import { useGlobal } from 'reactn'
import { testProps } from '../lib/utility'
import { PV } from '../resources'

type Props = {
  containerStyle?: any
  inputContainerStyle?: any
  onChangeText: any
  onClear: any
  placeholder?: string
  testID: string
  value?: string
}

export const PVSearchBar = (props: Props) => {
  const { containerStyle, inputContainerStyle, onChangeText, onClear, placeholder, testID, value } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  return (
    <SearchBar
      autoCorrect={false}
      clearIcon={{ size: 24 }}
      containerStyle={[globalTheme.textInputWrapper, containerStyle]}
      inputContainerStyle={[globalTheme.inputContainerText, inputContainerStyle]}
      inputStyle={PV.Fonts.fontScale.largest === fontScaleMode ? { fontSize: PV.Fonts.largeSizes.md } : {}}
      onChangeText={onChangeText}
      onClear={onClear}
      placeholder={placeholder}
      returnKeyType='done'
      searchIcon={{ size: 24 }}
      style={globalTheme.textInput}
      {...(testID ? testProps(`${testID}_search_bar`) : {})}
      value={value}
    />
  )
}
