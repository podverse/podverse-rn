import React from 'react'
import { StyleSheet, Switch, TouchableWithoutFeedback, View } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Text, TextInput } from './'

type Props = {
  accessible?: boolean
  accessibilityHint?: string
  accessibilityLabel?: string
  inputAutoCorrect?: boolean
  inputEditable?: boolean
  inputEyebrowTitle?: string
  inputHandleBlur?: any
  inputHandleSubmit?: any
  inputHandleTextChange?: any
  inputPlaceholder?: string
  inputShow?: boolean
  inputText?: string
  input2AutoCorrect?: boolean
  input2Editable?: boolean
  input2EyebrowTitle?: string
  input2HandleBlur?: any
  input2HandleSubmit?: any
  input2HandleTextChange?: any
  input2Placeholder?: string
  input2Show?: boolean
  input2Text?: string
  onValueChange: any
  subText?: string
  subTextAccessible?: boolean
  testID: string
  text: string
  value: boolean
  wrapperStyle?: any
}

export const SwitchWithText = (props: Props) => {
  const {
    accessible = true,
    accessibilityHint,
    accessibilityLabel,
    inputAutoCorrect,
    inputEditable,
    inputEyebrowTitle,
    inputHandleBlur,
    inputHandleSubmit,
    inputHandleTextChange,
    inputPlaceholder,
    inputShow,
    inputText,
    input2AutoCorrect,
    input2Editable,
    input2EyebrowTitle,
    input2HandleBlur,
    input2HandleSubmit,
    input2HandleTextChange,
    input2Placeholder,
    input2Show,
    input2Text,
    onValueChange,
    subText,
    subTextAccessible = false,
    testID,
    text,
    value,
    wrapperStyle = {}
  } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View style={wrapperStyle}>
      <TouchableWithoutFeedback
        accessible={accessible}
        accessibilityRole='switch'
        importantForAccessibility='no'
        onPress={onValueChange}>
        <View accessible={false} style={styles.switchWrapper}>
          <Switch
            accessible={false}
            accessibilityHint={accessibilityHint}
            accessibilityLabel={accessibilityLabel}
            importantForAccessibility='yes'
            onValueChange={onValueChange}
            value={value}
            {...(testID ? { testID: `${testID}_switch`.prependTestId() } : {})} />
          <Text
            accessible={false}
            accessibilityLabel=''
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            importantForAccessibility='no'
            style={styles.text}
            {...(testID ? { testID: `${testID}_text` } : {})}>
            {text}
          </Text>
        </View>
      </TouchableWithoutFeedback>
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
          {...(testID ? { testID: `${testID}_text_input` } : {})}
          underlineColorAndroid='transparent'
          value={inputText}
          wrapperStyle={styles.textInputWrapper}
        />
      )}
      {input2Show && (
        <TextInput
          autoCapitalize='none'
          autoCorrect={input2AutoCorrect}
          editable={!!input2Editable}
          eyebrowTitle={input2EyebrowTitle}
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          numberOfLines={1}
          onBlur={input2HandleBlur}
          onChangeText={input2HandleTextChange}
          onSubmitEditing={input2HandleSubmit}
          placeholder={input2Placeholder}
          returnKeyType='done'
          secureTextEntry
          style={[globalTheme.textInput, styles.textInput]}
          {...(testID ? { testID: `${testID}_text_input_2` } : {})}
          underlineColorAndroid='transparent'
          value={input2Text}
          wrapperStyle={styles.textInputWrapper}
        />
      )}
      {!!subText && (
        <Text
          accessible={subTextAccessible}
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
