import React from 'react'
import { Platform, StyleSheet } from 'react-native'
import { ButtonGroup } from 'react-native-elements'
import { useGlobal } from 'reactn'
import { PV } from '../resources'

type Props = {
  buttons: any[]
  onPress: any
  selectedIndex: number
  styles?: any
  testID: string
}

export const PVButtonGroup = (props: Props) => {
  const { buttons, onPress, selectedIndex, testID } = props
  const [globalTheme] = useGlobal('globalTheme')
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const textStyle =
    PV.Fonts.fontScale.largest === fontScaleMode ? [styles.text, { fontSize: PV.Fonts.largeSizes.md }] : [styles.text]

  return (
    <ButtonGroup
      accessible={false}
      activeOpacity={0.7}
      buttons={buttons}
      buttonStyle={[styles.button, globalTheme.buttonGroup]}
      containerStyle={styles.container}
      onPress={onPress}
      selectedButtonStyle={[styles.selectedButton, globalTheme.buttonGroupSelected]}
      selectedIndex={selectedIndex}
      selectedTextStyle={globalTheme.buttonGroupTextSelected}
      textStyle={[textStyle, globalTheme.buttonGroupText]}
      testID={`${testID}_button_group`.prependTestId()} />
  )
}

const styles = StyleSheet.create({
  button: {
    minHeight: 40
  },
  container: {
    marginTop: 12,
    minHeight: 40
  },
  selectedButton: {
    flex: 0
  },
  text: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: Platform.OS === 'android' ? 4 : 0
  }
})
