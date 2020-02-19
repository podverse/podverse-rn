import React from 'react'
import { Picker, Platform, StyleSheet } from 'react-native'
import { useGlobal } from 'reactn'
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
    arr.push(
      <Picker.Item
        key={i + key}
        label={i.toString()}
        value={i} />
    )
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
  const stylesText = Platform.OS === 'android' ? [
    styles.text,
    {
      marginLeft: 8,
      textAlign: 'left'
    }
  ] : styles.text

  return (
    <View style={styles.view}>
      <View style={styles.pickersWrapper}>
        <View style={styles.pickerColumn}>
          <Picker
            enabled={!isActive}
            itemStyle={[styles.number, globalTheme.text]}
            onValueChange={(itemValue) => {
              handleUpdateSleepTimer(itemValue, currentMinute, currentSecond)
            }}
            selectedValue={currentHour}
            style={styles.numberColumn}>
            {hourItems}
          </Picker>
          <Text style={[stylesText, globalTheme.text]}>hours</Text>
        </View>
        <View style={styles.pickerColumn}>
          <Picker
            enabled={!isActive}
            itemStyle={[styles.number, globalTheme.text]}
            onValueChange={(itemValue) => {
              handleUpdateSleepTimer(currentHour, itemValue, currentSecond)
            }}
            selectedValue={currentMinute}
            style={styles.numberColumn}>
            {minuteItems}
          </Picker>
          <Text style={[stylesText, globalTheme.text]}>minutes</Text>
        </View>
        <View style={styles.pickerColumn}>
          <Picker
            enabled={!isActive}
            itemStyle={[styles.number, globalTheme.text]}
            onValueChange={async (itemValue) => {
              handleUpdateSleepTimer(currentHour, currentMinute, itemValue)
            }}
            selectedValue={currentSecond}
            style={styles.numberColumn}>
            {secondItems}
          </Picker>
          <Text style={[stylesText, globalTheme.text]}>seconds</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  number: {
    fontSize: 28,
    fontWeight: PV.Fonts.weights.bold
  },
  numberColumn: {
    flex: 0,
    height: 80
  },
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
  view: {
    flex: 0
  }
})
