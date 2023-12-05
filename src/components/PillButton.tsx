import React from 'react'
import { StyleSheet } from 'react-native'
import { PV } from '../resources'
import { PressableWithOpacity, Text } from './'

type Props = {
  handleOnPress: any
  buttonTitle: string
  testID: string
  style?: any
  destructive?: boolean
  selected?: boolean 
}

export const PillButton = (props: Props) => {
  const { handleOnPress, buttonTitle, testID, style, destructive, selected } = props

  let destructButtonStyles = {}
  let destructTextStyles = {}
  if (destructive) {
    destructButtonStyles = styles.destructiveButtonStyle
    destructTextStyles = styles.destructiveTextStyle
  }

  if (selected) {
    destructButtonStyles = styles.selectedButtonStyle
    destructTextStyles = styles.selectedTextStyle
  }

  return (
    <PressableWithOpacity
      accessibilityLabel={buttonTitle}
      hitSlop={{
        bottom: 4,
        left: 8,
        right: 8,
        top: 4
      }}
      onPress={handleOnPress}
      style={[styles.buttonView, destructButtonStyles, style]}
      {...(testID ? { testID: `${testID}_pill_button`.prependTestId() } : {})}>
      <Text
        fontSizeLargerScale={PV.Fonts.largeSizes.md}
        fontSizeLargestScale={PV.Fonts.largeSizes.sm}
        testID={testID}
        style={[styles.buttonText, destructTextStyles]}>
        {buttonTitle.toUpperCase()}
      </Text>
    </PressableWithOpacity>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderColor: PV.Colors.brandBlueLight,
    borderWidth: 1,
    borderRadius: 15,
    minWidth: 120,
    minHeight: 32,
    maxWidth: 200, // Smallest iPad width divided by 5
    backgroundColor: PV.Colors.velvet
  },
  buttonText: {
    color: PV.Colors.brandBlueLight,
    fontSize: PV.Fonts.sizes.tiny
  },
  destructiveButtonStyle: {
    borderColor: PV.Colors.redLighter
  },
  destructiveTextStyle: {
    color: PV.Colors.redLighter
  },
  selectedButtonStyle: {
    borderColor: PV.Colors.brandBlueLight,
    backgroundColor: PV.Colors.white
  },
  selectedTextStyle: {
    color: PV.Colors.velvet
  }
})
