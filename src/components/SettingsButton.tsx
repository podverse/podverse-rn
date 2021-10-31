import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Icon } from './'

type Props = {
  accessibilityHint?: string
  accessibilityLabel?: string
  handleToggleSettings: any
  showCheckmark?: boolean
  testID: string
}

export const SettingsButton = (props: Props) => {
  const { accessibilityHint, accessibilityLabel, handleToggleSettings,
    showCheckmark, testID } = props

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
      onPress={handleToggleSettings}
      testID={testID}>
      <View style={styles.buttonView}>
        <View>
          <Icon
            isSecondary
            name={showCheckmark ? 'check' : 'cog'}
            size={18}
            solid />
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
