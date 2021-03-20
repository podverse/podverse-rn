import React from 'react'
import { Image } from 'react-native'
import { SearchBar } from 'react-native-elements'
import { useGlobal } from 'reactn'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { Icon } from '.'

type Props = {
  containerStyle?: any
  handleClear?: any
  inputRef?: any
  onChangeText: any
  onClear: any
  placeholder?: string
  testID: string
  value?: string
}

export const PVSearchBar = (props: Props) => {
  const { containerStyle, handleClear, inputRef, onChangeText, placeholder, testID, value } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  const inputStyle = PV.Fonts.fontScale.largest === fontScaleMode ? { fontSize: PV.Fonts.largeSizes.md } : {}

  return (
    <SearchBar
      autoCorrect={false}
      clearIcon={<Icon name='times' onPress={handleClear} size={20} />}
      containerStyle={[styles.containerStyle, containerStyle]}
      inputContainerStyle={styles.inputContainerStyle}
      inputStyle={[styles.inputStyle, globalTheme.textInput, inputStyle]}
      onChangeText={onChangeText}
      placeholder={placeholder}
      ref={inputRef}
      returnKeyType='done'
      searchIcon={<Image source={PV.Images.SEARCH} resizeMode='contain' style={styles.imageStyle} />}
      {...(testID ? testProps(`${testID}_search_bar`) : {})}
      value={value}
    />
  )
}

const styles = {
  containerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingLeft: 12,
    paddingRight: 16
  },
  inputContainerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0
  },
  inputStyle: {
    fontSize: PV.Fonts.sizes.xxl,
    borderWidth: 0,
    marginLeft: 18
  },
  imageStyle: {
    width: 28,
    height: 28,
    tintColor: 'white'
  }
}
