import React from 'react'
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useGlobal } from 'reactn'
import { convertSecToHHMMSS } from '../lib/utility'
import { PV } from '../resources'
import { core } from '../styles'
import { Text } from './'

type Props = {
  accessibilityHint?: string
  handleClearTime?: any
  handlePreview?: any
  handleSetTime: any
  labelText?: string
  placeholder?: string
  previewAccessibilityHint?: string
  previewAccessibilityLabel?: string
  testID: string
  time?: number | null
}

export const TimeInput = (props: Props) => {
  const { accessibilityHint, handlePreview, handleSetTime, labelText, placeholder,
    previewAccessibilityHint, previewAccessibilityLabel, testID, time } = props
  const [globalTheme] = useGlobal('globalTheme')
  const text = time || time === 0 ? convertSecToHHMMSS(time) : placeholder

  const accessibilityLabel = `${labelText}, ${text}`

  return (
    <View style={styles.timeInputWrapper}>
      <TouchableWithoutFeedback
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole='button'
        onPress={handleSetTime}
        testID={`${testID}_time_input_set_button`.prependTestId()}>
        <View style={styles.timeInputTextWrapper}>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            style={[globalTheme.textInputEyeBrow, core.textInputEyeBrow]}>
            {labelText}
          </Text>
          <View style={[styles.timeInputTouchable, globalTheme.textInput]}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              style={[
                styles.timeInputText,
                globalTheme.textInput,
                time || time === 0 ? {} : globalTheme.placeholderText
              ]}>
              {text}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {(time || time === 0) && (
        <TouchableOpacity
          accessibilityHint={previewAccessibilityHint}
          accessibilityLabel={previewAccessibilityLabel}
          accessibilityRole='button'
          hitSlop={{
            bottom: 4,
            left: 4,
            right: 4,
            top: 4
          }}
          onPress={handlePreview}
          testID={`${testID}_time_input_preview_button`.prependTestId()}>
          <Icon
            color={globalTheme.dropdownButtonText.color}
            name='play'
            size={20}
            style={styles.previewIcon} />
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  previewIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 47,
    marginBottom: 4,
    paddingHorizontal: 16
  },
  row: {
    alignItems: 'center'
  },
  timeInputText: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold
  },
  timeInputTouchable: {},
  timeInputTouchableDelete: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    marginLeft: -44,
    marginTop: 2,
    width: 46
  },
  timeInputWrapper: {
    backgroundColor: PV.Colors.velvet,
    flex: 1,
    flexDirection: 'row',
    height: 71,
    paddingVertical: 12
  },
  timeInputTextWrapper: {
    flex: 1,
    flexDirection: 'column',
    paddingHorizontal: 16
  }
})
