import React from 'react'
import { Platform, Pressable, TextInput } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { core } from '../styles'
import { Text, View } from '.'

type Props = {
  accessibilityHint?: string
  accessibilityLabel?: string
  alwaysShowEyebrow?: boolean
  autoCapitalize?: any
  autoCompleteType?: any
  autoCorrect?: boolean
  defaultValue?: string
  editable?: boolean
  eyebrowTitle?: string
  fontSizeLargerScale?: number
  fontSizeLargestScale?: number
  inputRef?: any
  keyboardType?: any
  numberOfLines?: number
  onBlur?: any
  onFocus?: any
  onChange?: any
  onChangeText?: any
  onPress?: any
  onSubmitEditing?: any
  outerWrapperStyle?: any
  placeholder?: string
  placeholderTextColor?: string
  returnKeyType?: any
  secureTextEntry?: boolean
  subText?: string
  subTextAlignRight?: boolean
  style?: any
  testID: string
  underlineColorAndroid?: any
  value?: string
}

export const PVTextInput = (props: Props) => {
  const {
    accessibilityHint,
    accessibilityLabel,
    alwaysShowEyebrow,
    autoCapitalize,
    autoCompleteType,
    autoCorrect,
    defaultValue,
    editable = true,
    eyebrowTitle,
    inputRef,
    keyboardType,
    numberOfLines = 1,
    onBlur,
    onFocus,
    onChange,
    onChangeText,
    onPress,
    onSubmitEditing,
    outerWrapperStyle,
    placeholder,
    placeholderTextColor,
    returnKeyType = 'default',
    secureTextEntry,
    subText,
    subTextAlignRight,
    style,
    underlineColorAndroid,
    testID,
    value
  } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const textInputStyle = []
  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    textInputStyle.push({ fontSize: PV.Fonts.largeSizes.xxl })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    textInputStyle.push({ fontSize: PV.Fonts.largeSizes.md })
  }

  if (Platform.OS === 'ios') {
    if (!value && numberOfLines > 1 && placeholder) {
      textInputStyle.push({ flex: 0, justifyContent: 'center', minHeight: 59, paddingTop: 16, paddingBottom: 0 })
    } else if (!value && numberOfLines === 1 && placeholder) {
      textInputStyle.push({ flex: 0, justifyContent: 'center', minHeight: 59, paddingTop: 0, paddingBottom: 0 })
    }
  }

  const textInputSubTextStyle = subTextAlignRight ? { textAlign: 'right' } : null

  const hasText = !!value && value.length

  const inputComponent = (
    <View style={[core.textInputWrapperOuter, outerWrapperStyle]}>
      <View style={[globalTheme.textInputWrapper, core.textInputWrapper]}>
        {(hasText || alwaysShowEyebrow) && (!!eyebrowTitle || !!placeholder) && (
          <Text
            accessible={false}
            importantForAccessibility='no'
            style={[globalTheme.textInputEyeBrow, core.textInputEyeBrow]}
            testID={`${testID}_text_input_eyebrow`}>
            {eyebrowTitle || placeholder}
          </Text>
        )}
        <TextInput
          accessible
          accessibilityLabel={accessibilityLabel}
          autoCapitalize={autoCapitalize}
          autoCompleteType={autoCompleteType}
          autoCorrect={autoCorrect}
          blurOnSubmit={returnKeyType === 'done'}
          defaultValue={defaultValue}
          editable={!!editable}
          keyboardType={keyboardType}
          importantForAccessibility={!onPress ? 'yes' : 'no'}
          multiline={numberOfLines > 1}
          numberOfLines={hasText ? numberOfLines : 1}
          onBlur={onBlur}
          onFocus={onFocus}
          onChange={onChange}
          onChangeText={onChangeText}
          onPressIn={onPress}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor || globalTheme.placeholderText.color}
          ref={inputRef}
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry}
          style={[globalTheme.textInput, core.textInput, textInputStyle, style]}
          underlineColorAndroid={underlineColorAndroid}
          {...(testID ? { testID: `${testID}_text_input`.prependTestId() } : {})}
          value={value}
        />
      </View>
      {!!subText && (
        <Text
          accessible
          importantForAccessibility='yes'
          style={[globalTheme.textInputSubText, core.textInputSubText, textInputSubTextStyle]}
          testID={`${testID}_text_input_sub_text`}>
          {subText}
        </Text>
      )}
    </View>
  )

  return !!onPress ? (
    <Pressable
      accessible={!!onPress}
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      importantForAccessibility={!!onPress ? 'yes' : 'no'}
      onPress={onPress}>
      {inputComponent}
    </Pressable>
  ) : (
    inputComponent
  )
}
