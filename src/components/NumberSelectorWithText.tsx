import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View } from 'react-native'
import { useGlobal } from 'reactn'
import { convertSecToHHMMSS } from '../lib/utility'
import { PV } from '../resources'
import { Text, TextInput } from './'

type Props = {
  accessibilityHint?: string
  accessibilityLabel?: string
  editable?: boolean
  handleChangeText?: any
  handleOnBlur?: any
  handleSubmitEditing?: any
  isHHMMSS?: boolean
  isSmallText?: boolean
  selectedNumber?: number | string | null
  subText?: string
  testID: string
  text: string
  textInputOnPress?: any
  textInputStyle?: any
  wrapperOnPress?: any
}

export const NumberSelectorWithText = (props: Props) => {
  const { accessibilityHint, accessibilityLabel, editable, handleChangeText, handleOnBlur,
    handleSubmitEditing,isHHMMSS, isSmallText, selectedNumber = 0, subText, testID, text,
    textInputOnPress, textInputStyle = {}, wrapperOnPress } = props
  const [globalTheme] = useGlobal('globalTheme')

  let strNum = ''
  const parsedNumber =
    typeof selectedNumber === 'string' ? parseInt(selectedNumber, 10) : selectedNumber
  if (parsedNumber || parsedNumber === 0) {
    strNum = isHHMMSS ? convertSecToHHMMSS(parsedNumber) : parsedNumber.toString()
  }

  const textInput = (
    <View
      accessibilityHint={!!wrapperOnPress ? '' : accessibilityHint}
      accessibilityLabel={!!wrapperOnPress ? '' : accessibilityLabel}
      style={styles.innerWrapper}>
      <TextInput
        accessibilityLabel={accessibilityLabel}
        autoCompleteType='off'
        editable={editable}
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        keyboardType='numeric'
        onBlur={handleOnBlur}
        onChangeText={handleChangeText}
        onPress={textInputOnPress}
        onSubmitEditing={handleSubmitEditing}
        placeholderTextColor={globalTheme.placeholderText.color}
        returnKeyType='done'
        style={[styles.textInput, textInputStyle]}
        testID={testID}
        value={strNum}
        wrapperStyle={{ marginBottom: 0 }}
      />
      <Text
        accessible={false}
        importantForAccessibility='no'
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        style={isSmallText ? styles.mediumText : styles.text}>
        {text}
      </Text>
    </View>
  )

  return (
    <View style={styles.outerWrapper}>
      {!!wrapperOnPress
        ? (
          <TouchableWithoutFeedback
            accessibilityHint={accessibilityHint}
            accessibilityLabel={accessibilityLabel}
            onPress={wrapperOnPress}>
            {textInput}
          </TouchableWithoutFeedback>
        )
        : textInput
      }
      {subText && (
        <Text
          accessible={false}
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          importantForAccessibility='no'
          style={[globalTheme.textSecondary, styles.subText]}
          {...(testID ? { testID: `${testID}_sub_text` } : {})}>
          {subText}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  innerWrapper: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  outerWrapper: {},
  smallText: {
    flex: 1,
    marginHorizontal: 12
  },
  subText: {
    marginTop: 12,
    fontSize: PV.Fonts.sizes.md
  },
  text: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 12
  },
  textInput: {
    fontSize: PV.Fonts.sizes.xxl,
    justifyContent: 'center',
    textAlign: 'center',
    width: 44,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0
  }
})
