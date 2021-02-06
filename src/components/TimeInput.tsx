import React from 'react'
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useGlobal } from 'reactn'
import { convertSecToHHMMSS, testProps } from '../lib/utility'
import { PV } from '../resources'
import { core, darkTheme, iconStyles } from '../styles'
import { Text } from './'

type Props = {
  handleClearTime?: any
  handlePreview?: any
  handleSetTime: any
  labelText: string
  placeholder?: string
  testID: string
  time?: number | null
}

export const TimeInput = (props: Props) => {
  const { handlePreview, handleSetTime, labelText, placeholder, testID, time } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View style={styles.timeInputWrapper}>
      <TouchableWithoutFeedback onPress={handleSetTime} {...testProps(`${testID}_time_input_set_button`)}>
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
              {time || time === 0 ? convertSecToHHMMSS(time) : placeholder}
            </Text>
          </View>
        </View>
      </TouchableWithoutFeedback>
      {(time || time === 0) && (
        <TouchableOpacity
          hitSlop={{
            bottom: 4,
            left: 4,
            right: 4,
            top: 4
          }}
          onPress={handlePreview}
          {...testProps(`${testID}_time_input_preview_button`)}>
          <Icon color={globalTheme.dropdownButtonText.color} name='play' size={20} style={styles.previewIcon} />
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
    marginBottom: 4
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
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  timeInputTextWrapper: {
    flex: 1,
    flexDirection: 'column'
  }
})
