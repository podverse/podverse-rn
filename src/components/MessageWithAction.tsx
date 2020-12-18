import { StyleSheet, TouchableOpacity } from 'react-native'
import React, { useGlobal } from 'reactn'
import { PV } from '../resources'
import { ActivityIndicator, Button, Text, View } from './'

type Props = {
  bottomActionHandler?: any
  bottomActionText?: string
  isLoading?: boolean
  message?: string
  middleActionHandler?: any
  middleActionText?: string
  subMessage?: string
  testID: string
  topActionHandler?: any
  topActionText?: string
  transparent?: boolean
}

export const MessageWithAction = (props: Props) => {
  const {
    bottomActionHandler,
    bottomActionText,
    isLoading,
    message,
    middleActionHandler,
    middleActionText,
    subMessage,
    testID,
    topActionHandler,
    topActionText,
    transparent
  } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View style={styles.view} transparent={transparent}>
      {!!message && (
        <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={[globalTheme.text, styles.message]}>
          {message}
        </Text>
      )}
      {!!subMessage && (
        <Text fontSizeLargestScale={PV.Fonts.largeSizes.sm} style={[globalTheme.text, styles.subMessage]}>
          {subMessage}
        </Text>
      )}
      {!isLoading && !!topActionText && !!topActionHandler && (
        <Button
          onPress={topActionHandler}
          testID={`${testID}_top_action`}
          text={topActionText}
          wrapperStyles={styles.button}
        />
      )}
      {!isLoading && !!middleActionText && !!middleActionHandler && (
        <Button
          onPress={middleActionHandler}
          testID={`${testID}_middle_action`}
          text={middleActionText}
          wrapperStyles={styles.button}
        />
      )}
      {!isLoading && !!bottomActionText && !!bottomActionHandler && (
        <Button
          onPress={bottomActionHandler}
          testID={`${testID}_bottom_action`}
          text={bottomActionText}
          wrapperStyles={styles.button}
        />
      )}
      {isLoading && <ActivityIndicator />}
    </View>
  )
}

const styles = StyleSheet.create({
  button: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 16,
    marginTop: 24,
    minHeight: 44,
    paddingVertical: 16,
    width: '80%',
    backgroundColor: 'transparent',
    borderColor: PV.Colors.white,
    borderWidth: 1,
    borderRadius: 8
  },
  message: {
    fontSize: PV.Fonts.sizes.xl,
    marginHorizontal: 16,
    minHeight: 44,
    textAlign: 'center'
  },
  subMessage: {
    fontSize: PV.Fonts.sizes.md,
    marginHorizontal: 16,
    marginTop: 12,
    minHeight: 44,
    textAlign: 'center'
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})
