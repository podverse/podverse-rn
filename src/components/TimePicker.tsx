import { Picker } from '@react-native-picker/picker'
import React from 'react'
import { Platform, StyleSheet } from 'react-native'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { getHHMMSSArray } from '../lib/utility'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  currentTime: number
  handleUpdateSleepTimer: any
  isActive: boolean
}

const generatePickerNumberItems = (total: number, key: string) => {
  const arr = [] as any
  for (let i = 0; i < total; i++) {
    arr.push(<Picker.Item key={i + key} label={i.toString()} value={i} />)
  }

  return arr
}

const hourItems = generatePickerNumberItems(24, 'hourItems')
const minuteItems = generatePickerNumberItems(60, 'minuteItems')
const secondItems = generatePickerNumberItems(60, 'secondItems')

export const TimePicker = (props: Props) => {
  const { currentTime, handleUpdateSleepTimer, isActive } = props
  const [globalTheme] = useGlobal('globalTheme')

  const hhmmssArray = getHHMMSSArray(currentTime)
  const currentHour = hhmmssArray[0]
  const currentMinute = hhmmssArray[1]
  const currentSecond = hhmmssArray[2]

  // I cannot figure out how to center the picker text on Android :[
  // Aligning text to the left on Android as a workaround
  const stylesText =
    Platform.OS === 'android'
      ? [
          styles.text,
          {
            marginLeft: 8,
            textAlign: 'left'
          }
        ]
      : styles.text

  return (
    <View style={styles.view}>
      <View style={styles.pickersWrapper}>
        <View style={styles.pickerColumn}>
          <Picker
            enabled={!isActive}
            itemStyle={[styles.timeNumber, globalTheme.text]}
            onValueChange={(itemValue) => {
              handleUpdateSleepTimer(itemValue, currentMinute, currentSecond)
            }}
            selectedValue={currentHour}
            style={styles.timeNumberColumn}>
            {hourItems}
          </Picker>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.xs} style={[stylesText, globalTheme.text]}>
            {translate('hours')}
          </Text>
        </View>
        <View style={styles.pickerColumn}>
          <Picker
            enabled={!isActive}
            itemStyle={[styles.timeNumber, globalTheme.text]}
            onValueChange={(itemValue) => {
              handleUpdateSleepTimer(currentHour, itemValue, currentSecond)
            }}
            selectedValue={currentMinute}
            style={styles.timeNumberColumn}>
            {minuteItems}
          </Picker>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.xs} style={[stylesText, globalTheme.text]}>
            {translate('minutes')}
          </Text>
        </View>
        <View style={styles.pickerColumn}>
          <Picker
            enabled={!isActive}
            itemStyle={[styles.timeNumber, globalTheme.text]}
            onValueChange={(itemValue) => {
              handleUpdateSleepTimer(currentHour, currentMinute, itemValue)
            }}
            selectedValue={currentSecond}
            style={styles.timeNumberColumn}>
            {secondItems}
          </Picker>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.xs} style={[stylesText, globalTheme.text]}>
            {translate('seconds')}
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  pickerColumn: {
    flex: 1
  },
  pickersWrapper: {
    flex: 0,
    flexDirection: 'row'
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    textAlign: 'center'
  },
  timeNumber: {
    fontSize: 28,
    fontWeight: PV.Fonts.weights.bold
  },
  timeNumberColumn: {
    flex: 0,
    height: 216
  },
  view: {
    flex: 0
  }
})
