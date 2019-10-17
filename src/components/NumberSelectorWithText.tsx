import React from 'react'
import { StyleSheet, View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { core } from '../styles'
import { Text } from './'

type Props = {
  handleSelectNumber: any
  isSmallText?: boolean
  items: any
  selectedNumber?: number | null
  text: string
}

export const NumberSelectorWithText = (props: Props) => {
  const { handleSelectNumber, isSmallText, items, selectedNumber, text } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View style={styles.wrapper}>
      <RNPickerSelect
        items={items}
        onValueChange={handleSelectNumber}
        placeholder={''}
        // style={isDarkMode}
        useNativeAndroidPickerStyle={false}
        value={selectedNumber}>
        <View style={[globalTheme.textInput, core.textInput, styles.input]}>
          <Text style={styles.inputText}>{selectedNumber}</Text>
        </View>
      </RNPickerSelect>
      <Text style={isSmallText ? styles.smallText : styles.text}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    width: 51
  },
  inputText: {
    fontSize: PV.Fonts.sizes.xl,
    textAlign: 'center'
  },
  smallText: {
    flex: 1,
    marginHorizontal: 12
  },
  text: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 12
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 12
  }
})
