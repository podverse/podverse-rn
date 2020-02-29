import { StyleSheet, TouchableOpacity } from 'react-native'
import React, { getGlobal } from 'reactn'
import { PV } from '../resources'
import { ActivityIndicator, Text, View } from './'

type Props = {
  bottomActionHandler?: any
  bottomActionText?: string
  isLoading?: boolean
  message?: string
  subMessage?: string
  topActionHandler?: any
  topActionText?: string
}

export const MessageWithAction = (props: Props) => {
  const { bottomActionHandler, bottomActionText, isLoading, message, subMessage, topActionHandler,
    topActionText } = props
  const { fontScaleMode, globalTheme } = getGlobal()

  const messageStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
    [styles.message, { fontSize: 10 }] :
    [styles.message]
  const subMessageStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
    [styles.subMessage, { fontSize: 9 }] :
    [styles.subMessage]
  const buttonStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
    [styles.button, { fontSize: 9 }] :
    [styles.button]

  return (
    <View style={styles.view}>
      {!!message && (
        <Text style={[globalTheme.text, messageStyle]}>{message}</Text>
      )}
      {!!subMessage && (
        <Text style={[globalTheme.text, subMessageStyle]}>{subMessage}</Text>
      )}
      {!isLoading && !!topActionText && topActionHandler && (
        <TouchableOpacity onPress={topActionHandler}>
          <Text style={[buttonStyle, globalTheme.text]}>{topActionText}</Text>
        </TouchableOpacity>
      )}
      {!isLoading && !!bottomActionText && bottomActionHandler && (
        <TouchableOpacity onPress={bottomActionHandler}>
          <Text style={[buttonStyle, globalTheme.text]}>{bottomActionText}</Text>
        </TouchableOpacity>
      )}
      {isLoading && <ActivityIndicator />}
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
