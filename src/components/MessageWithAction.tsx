import { StyleSheet, TouchableOpacity } from 'react-native'
import React, { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  actionHandler?: any
  actionText?: string
  message?: string
  subMessage?: string
}

export const MessageWithAction = (props: Props) => {
  const { actionHandler, actionText, message, subMessage } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View style={styles.view}>
      {!!message && (
        <Text style={[globalTheme.text, styles.message]}>{message}</Text>
      )}
      {!!subMessage && (
        <Text style={[globalTheme.text, styles.subMessage]}>{subMessage}</Text>
      )}
      {!!actionText && actionHandler && (
        <TouchableOpacity onPress={actionHandler}>
          <Text style={[globalTheme.text, styles.button]}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    height: 44,
    lineHeight: 44,
    marginHorizontal: 16,
    marginVertical: 12
  },
  message: {
    fontSize: PV.Fonts.sizes.xl,
    marginHorizontal: 16,
    marginVertical: 12,
    textAlign: 'center'
  },
  subMessage: {
    fontSize: PV.Fonts.sizes.md,
    marginHorizontal: 16,
    marginVertical: 12,
    textAlign: 'center'
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})
