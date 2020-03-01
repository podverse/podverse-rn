import React from 'react'
import { StyleSheet } from 'react-native'
import { ButtonGroup } from 'react-native-elements'
import { getGlobal } from 'reactn'
import { PV } from '../resources'

type Props = {
  buttons: any[]
  onPress: any
  selectedIndex: number
  styles?: any
}

export const PVButtonGroup = (props: Props) => {
  const { buttons, onPress, selectedIndex } = props
  const { fontScaleMode, globalTheme } = getGlobal()

  const textStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
    [styles.text, { fontSize: PV.Fonts.largeSizes.md }] :
    [styles.text]

  return (
    <ButtonGroup
      buttons={buttons}
      buttonStyle={[styles.button, globalTheme.buttonGroup]}
      containerStyle={styles.container}
      onPress={onPress}
      selectedButtonStyle={[
        styles.selectedButton,
        globalTheme.buttonGroupSelected
      ]}
      selectedIndex={selectedIndex}
      selectedTextStyle={globalTheme.buttonGroupTextSelected}
      textStyle={[textStyle, globalTheme.buttonGroupText]}
    />
  )
}

const styles = StyleSheet.create({
  button: {
    height: 56
  },
  container: {
    height: 56,
    marginTop: 12
  },
  selectedButton: {
    flex: 0
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  }
})
