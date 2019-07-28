import React from 'react'
import { StyleSheet, Text as RNText, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useGlobal } from 'reactn'
import { convertSecToHHMMSS } from '../lib/utility'
import { PV } from '../resources'
import { core, darkTheme, iconStyles } from '../styles'
import { Text } from './'

type Props = {
  handleClearTime?: any
  handlePreview?: any
  handleSetTime: any
  labelText: string
  placeholder?: string
  time?: number | null
  wrapperStyle?: any
}

export const TimeInput = (props: Props) => {
  const { handleClearTime, handlePreview, handleSetTime, labelText, placeholder, time, wrapperStyle } = props
  const [globalTheme] = useGlobal('globalTheme')
  const isDarkMode = globalTheme === darkTheme

  return (
    <View style={wrapperStyle}>
      <View style={core.row}>
        <Text style={core.textInputLabel}>{labelText}</Text>
        {
          (time || time === 0) &&
            <TouchableOpacity onPress={handlePreview}>
              <Icon
                color={globalTheme.link.color}
                name='play'
                size={16}
                style={styles.previewIcon} />
            </TouchableOpacity>
        }
      </View>
      <View style={core.row}>
        <View style={styles.timeInputWrapper}>
          <TouchableWithoutFeedback onPress={handleSetTime}>
            <View style={[
              styles.timeInputTouchable,
              globalTheme.textInput
            ]}>
              <RNText style={[
                styles.timeInputText,
                globalTheme.textInput,
                time || time === 0 ? {} : globalTheme.placeholderText
              ]}>
                {time || time === 0 ? convertSecToHHMMSS(time) : placeholder}
              </RNText>
            </View>
          </TouchableWithoutFeedback>
        </View>
        {
          handleClearTime &&
            <TouchableWithoutFeedback onPress={handleClearTime}>
              <View style={[
                styles.timeInputTouchableDelete,
                globalTheme.textInput
              ]}>
                <Icon
                  color={isDarkMode ? iconStyles.dark.color : iconStyles.light.color}
                  name='times'
                  size={24} />
              </View>
            </TouchableWithoutFeedback>
        }
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  previewIcon: {
    paddingLeft: 12,
    paddingRight: 20,
    paddingTop: 3
  },
  timeInputText: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xl,
    height: 44,
    lineHeight: 44,
    textAlign: 'center'
  },
  timeInputTouchable: {
    flex: 1,
    height: 44
  },
  timeInputTouchableDelete: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 4,
    position: 'absolute',
    right: 0,
    top: 2,
    width: 54
  },
  timeInputWrapper: {
    flex: 1,
    height: 44,
    marginTop: 2
  }
})
