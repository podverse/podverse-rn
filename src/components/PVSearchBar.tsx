import React from 'react'
import { StyleSheet, View as RNView } from 'react-native'
import { SearchBar } from 'react-native-elements'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Icon, Text } from '.'

type Props = {
  containerStyle?: any
  handleClear?: any
  inputRef?: any
  onChangeText: any
  placeholder?: string
  subText?: string
  testID: string
  value?: string
}

export const PVSearchBar = (props: Props) => {
  const { containerStyle, handleClear, inputRef, onChangeText, placeholder, subText, testID, value } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  const inputStyle = PV.Fonts.fontScale.largest === fontScaleMode ? { fontSize: PV.Fonts.largeSizes.md } : {}

  return (
    <RNView>
      <SearchBar
        autoCorrect={false}
        clearIcon={<Icon name='times' onPress={handleClear} size={20} />}
        containerStyle={[styles.containerStyle, containerStyle]}
        inputContainerStyle={styles.inputContainerStyle}
        inputStyle={[styles.inputStyle, globalTheme.textInput, inputStyle]}
        onChangeText={onChangeText}
        placeholder={placeholder}
        ref={inputRef}
        returnKeyType='search'
        searchIcon={(
          <Icon
            accessible={false}
            color={PV.Colors.white}
            name={'search'}
            size={PV.Icons.NAV}
            solid />
        )}
        {...(testID ? { testID: `${testID}_search_bar` } : {})}
        value={value}
      />
      {!!subText && (
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          style={[globalTheme.textSecondary, styles.subText]}
          testID={`${testID}_search_bar_sub_text`}>
          {subText}
        </Text>
      )}
    </RNView>
  )
}

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 12
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
  },
  subText: {
    color: PV.Colors.grayLighter,
    fontSize: PV.Fonts.sizes.lg,
    marginBottom: 16,
    paddingHorizontal: 12
  }
})
