import React from 'react'
import { Platform, StyleSheet, View as RNView } from 'react-native'
import { SearchBar } from 'react-native-elements'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Icon, Text } from '.'

type Props = {
  accessible?: boolean
  containerStyle?: any
  handleClear?: any
  hideIcon?: boolean
  icon?: 'search' | 'filter'
  inputRef?: any
  onChangeText: any
  placeholder?: string
  subText?: string
  testID: string
  value?: string
}

export const PVSearchBar = (props: Props) => {
  const {
    accessible,
    containerStyle,
    handleClear,
    hideIcon,
    icon = 'search',
    inputRef,
    onChangeText,
    placeholder,
    subText,
    testID,
    value
  } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')
  const inputStyle = PV.Fonts.fontScale.largest === fontScaleMode ? { fontSize: PV.Fonts.largeSizes.md } : {}
  const iconName = icon === 'filter' ? 'filter' : 'search'
  const iconColor = icon === 'filter' ? PV.Colors.grayLighter : PV.Colors.white

  return (
    <RNView>
      <SearchBar
        accessible={accessible}
        autoCorrect={false}
        clearIcon={
          value ? (
            <Icon
              accessibilityLabel={translate('Clear input')}
              accessibilityRole='button'
              name='times'
              onPress={handleClear}
              size={20}
            />
          ) : null
        }
        onClear={handleClear}
        containerStyle={[styles.containerStyle, containerStyle]}
        inputContainerStyle={styles.inputContainerStyle}
        inputStyle={[globalTheme.textInput, styles.inputStyle, inputStyle]}
        onChangeText={onChangeText}
        placeholder={placeholder}
        ref={inputRef}
        returnKeyType='search'
        searchIcon={
          <Icon
            accessible={false}
            color={iconColor}
            importantForAccessibility='no-hide-descendants'
            name={!!hideIcon ? null : iconName}
            size={PV.Icons.NAV}
            solid
          />
        }
        {...(testID ? { testID: `${testID}_search_bar`.prependTestId() } : {})}
        value={value}
      />
      {!!subText && (
        <Text
          accessible={false}
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          importantForAccessibility='no'
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
    borderColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 12,
    paddingBottom: 0,
    paddingTop: 0
  },
  inputContainerStyle: {
    backgroundColor: PV.Colors.velvet,
    borderRadius: 6,
    borderWidth: 0,
    marginBottom: 6,
    marginTop: 4,
    height: 40
  },
  inputStyle: {
    borderWidth: 0,
    fontSize: PV.Fonts.sizes.xxl,
    marginHorizontal: 10,
    paddingTop: Platform.OS === 'android' ? 3 : 0,
    paddingBottom: Platform.OS === 'android' ? 3 : 0
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
