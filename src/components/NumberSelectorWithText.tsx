import React from 'react'
import { StyleSheet, TextInput, View } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Text } from './'

type Props = {
  handleChangeText: any
  handleSubmitEditing?: any
  isSmallText?: boolean
  selectedNumber?: number | string
  text: string
}

export const NumberSelectorWithText = (props: Props) => {
  const {
    handleChangeText,
    handleSubmitEditing,
    isSmallText,
    selectedNumber,
    text
  } = props
  const [globalTheme] = useGlobal('globalTheme')
  const strNum = Number.isInteger(selectedNumber)
    ? selectedNumber.toString()
    : selectedNumber
  return (
    <View style={styles.wrapper}>
      <TextInput
        autoCompleteType='off'
        keyboardType='numeric'
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmitEditing}
        placeholderTextColor={globalTheme.placeholderText.color}
        returnKeyType='done'
        style={[globalTheme.textInput, styles.textInput]}
        value={strNum}
      />
      <Text style={isSmallText ? styles.smallText : styles.text}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
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
  textInput: {
    fontSize: PV.Fonts.sizes.xl,
    height: 44,
    justifyContent: 'center',
    textAlign: 'center',
    width: 51
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 12
  }
})
