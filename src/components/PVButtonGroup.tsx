import React from 'react'
import { StyleSheet } from 'react-native'
import { ButtonGroup } from 'react-native-elements'
import { useGlobal } from 'reactn'
import { PV } from '../resources'

type Props = {
  buttons: any[]
  onPress: any
  selectedIndex: number
  styles?: any
}

export const PVButtonGroup = (props: Props) => {
  const { buttons, onPress, selectedIndex } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <ButtonGroup
      buttons={buttons}
      buttonStyle={[styles.button, globalTheme.buttonGroup]}
      containerStyle={styles.container}
      onPress={onPress}
      selectedButtonStyle={[styles.selectedButton, globalTheme.buttonGroupSelected]}
      selectedIndex={selectedIndex}
      selectedTextStyle={globalTheme.buttonGroupTextSelected}
      textStyle={[styles.text, globalTheme.buttonGroupText]} />
  )
}

const styles = StyleSheet.create({
  button: {
    height: 56
  },
  container: {
    marginTop: 12
  },
  selectedButton: {
    flex: 1
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  }
})
