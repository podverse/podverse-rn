import React from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { core } from '../styles'
import { Text } from './'

type Props = {
  onValueChange: any
  subText: string
  text: string
  value: boolean
}

export const SwitchWithText = (props: Props) => {
  const { onValueChange, subText, text, value } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View>
      <View style={styles.switchWrapper}>
        <Switch onValueChange={onValueChange} value={value} />
        <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.text}>
          {text}
        </Text>
      </View>
      {subText && (
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          style={[core.textInputSubTitle, globalTheme.textSecondary, styles.subText]}>
          {subText}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  subText: {
    marginTop: 8
  },
  switchWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: 12
  },
  text: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 12
  }
})
