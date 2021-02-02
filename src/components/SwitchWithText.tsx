import React from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import { useGlobal } from 'reactn'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { Text, TextInput } from './'

type Props = {
  inputAutoCorrect?: boolean
  inputEditable?: boolean
  inputEyebrowTitle?: string
  inputHandleBlur?: any
  inputHandleSubmit?: any
  inputHandleTextChange?: any
  inputPlaceholder?: string
  inputShow?: boolean
  inputText?: string
  onValueChange: any
  subText?: string
  testID: string
  text: string
  value: boolean
  wrapperStyle: any
}

export const SwitchWithText = (props: Props) => {
  const {
    inputAutoCorrect,
    inputEditable,
    inputEyebrowTitle,
    inputHandleBlur,
    inputHandleSubmit,
    inputHandleTextChange,
    inputPlaceholder,
    inputShow,
    inputText,
    onValueChange,
    subText,
    testID,
    text,
    value,
    wrapperStyle
  } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View style={wrapperStyle}>
      <View style={styles.switchWrapper}>
        <Switch onValueChange={onValueChange} value={value} {...(testID ? testProps(`${testID}_switch`) : {})} />
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          style={styles.text}
          {...(testID ? testProps(`${testID}_text`) : {})}>
          {text}
        </Text>
      </View>
      {inputShow && (
        <TextInput
          autoCapitalize='none'
          autoCorrect={inputAutoCorrect}
          editable={!!inputEditable}
          eyebrowTitle={inputEyebrowTitle}
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          numberOfLines={1}
          onBlur={inputHandleBlur}
          onChangeText={inputHandleTextChange}
          onSubmitEditing={inputHandleSubmit}
          placeholder={inputPlaceholder}
          returnKeyType='done'
          style={[globalTheme.textInput, styles.textInput]}
          {...(testID ? testProps(`${testID}_text_input`) : {})}
          underlineColorAndroid='transparent'
          value={inputText}
          wrapperStyle={styles.textInputWrapper}
        />
      )}
      {subText && (
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          style={[globalTheme.textSecondary, styles.subText]}
          {...(testID ? testProps(`${testID}_sub_text`) : {})}>
          {subText}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  subText: {
    marginTop: 16,
    fontSize: PV.Fonts.sizes.lg
  },
  switchWrapper: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  text: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 12
  },
  textInput: {
    fontSize: PV.Fonts.sizes.xxl,
    justifyContent: 'center'
  },
  textInputWrapper: {
    marginTop: 24
  }
})
