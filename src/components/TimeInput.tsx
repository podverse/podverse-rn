import React from 'react'
import { StyleSheet, Text as RNText, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { useGlobal } from 'reactn'
import { convertSecToHHMMSS } from '../lib/utility'
import { core, darkTheme, iconStyles } from '../styles'
import { Text } from './'

type Props = {
  handleClearTime?: any
  handlePreview?: any
  handleSetTime: any
  labelText: string
  placeholder?: string
  time?: number
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
        <TouchableOpacity onPress={handlePreview}>
          <Icon
            color={globalTheme.link.color}
            name='play'
            size={16}
            style={styles.previewIcon} />
        </TouchableOpacity>
      </View>
      <View>
        <TouchableWithoutFeedback
          onPress={handleSetTime}
          style={styles.timeInputTouchable}>
          <RNText style={[
            core.textInput,
            styles.timeInput,
            globalTheme.textInput,
            time || time === 0 ? {} : globalTheme.placeholderText
          ]}>
            {time ? convertSecToHHMMSS(time) : placeholder}
          </RNText>
        </TouchableWithoutFeedback>
        {
          handleClearTime &&
            <TouchableWithoutFeedback
              onPress={handleClearTime}
              style={styles.timeInputTouchable}>
              <Icon
                color={isDarkMode ? iconStyles.dark.color : iconStyles.light.color}
                name='times'
                size={24} />
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
  timeInput: {
    textAlign: 'center'
  },
  timeInputTouchable: {
    flex: 1
  },
  timeInputTouchableDelete: {
    flex: 0,
    width: 44
  }
})
