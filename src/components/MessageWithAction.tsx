import { StyleSheet, StyleProp, ViewStyle } from 'react-native'
import React, { useGlobal } from 'reactn'
import { PV } from '../resources'
import { ActivityIndicator, Button, SafeAreaView, Text } from './'

type Props = {
  bottomActionAccessibilityHint?: string
  bottomActionHandler?: any
  bottomActionText?: string
  isLoading?: boolean
  message?: string
  middleActionAccessibilityHint?: string
  middleActionHandler?: any
  middleActionText?: string
  subMessage?: string
  testID: string
  topActionAccessibilityHint?: string
  topActionHandler?: any
  topActionText?: string
  transparent?: boolean
  containerStyle?: StyleProp<ViewStyle>
}

export const MessageWithAction = (props: Props) => {
  const {
    bottomActionAccessibilityHint,
    bottomActionHandler,
    bottomActionText,
    isLoading,
    message,
    middleActionAccessibilityHint,
    middleActionHandler,
    middleActionText,
    subMessage,
    testID,
    topActionAccessibilityHint,
    topActionHandler,
    topActionText,
    transparent,
    containerStyle
  } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <SafeAreaView style={[styles.view, containerStyle]} transparent={transparent}>
      {!!message && (
        <Text
          accessible
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          style={[globalTheme.text, styles.message]}
          testID={`${testID}_message_with_action_message`}>
          {message}
        </Text>
      )}
      {!!subMessage && (
        <Text
          accessible
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          style={[globalTheme.text, styles.subMessage]}
          testID={`${testID}_message_with_action_sub_message`}>
          {subMessage}
        </Text>
      )}
      {!isLoading && !!topActionText && !!topActionHandler && (
        <Button
          accessibilityHint={topActionAccessibilityHint}
          accessibilityLabel={topActionText}
          onPress={topActionHandler}
          testID={`${testID}_message_with_action_top_button`}
          text={topActionText}
          wrapperStyles={styles.button}
        />
      )}
      {!isLoading && !!middleActionText && !!middleActionHandler && (
        <Button
          accessibilityHint={middleActionAccessibilityHint}
          accessibilityLabel={middleActionText}
          onPress={middleActionHandler}
          testID={`${testID}_message_with_action_middle_button`}
          text={middleActionText}
          wrapperStyles={styles.button}
        />
      )}
      {!isLoading && !!bottomActionText && !!bottomActionHandler && (
        <Button
          accessibilityHint={bottomActionAccessibilityHint}
          accessibilityLabel={bottomActionText}
          onPress={bottomActionHandler}
          testID={`${testID}_message_with_action_bottom_button`}
          text={bottomActionText}
          wrapperStyles={[styles.button, styles.bottomButton]}
        />
      )}
      {isLoading && <ActivityIndicator fillSpace testID={testID} />}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  bottomButton: {
    marginBottom: 0
  },
  button: {
    backgroundColor: 'transparent',
    borderColor: PV.Colors.white,
    borderWidth: 1,
    borderRadius: 8,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 16,
    marginBottom: 24,
    minHeight: 44,
    paddingVertical: 16,
    width: '80%'
  },
  message: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 32,
    marginHorizontal: 16,
    marginTop: -55,
    textAlign: 'center'
  },
  subMessage: {
    fontSize: PV.Fonts.sizes.md,
    marginHorizontal: 16,
    marginBottom: 32,
    marginTop: -12,
    textAlign: 'center'
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})
