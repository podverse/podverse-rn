import React from 'react'
import { StyleSheet } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { ActivityIndicator, PressableWithOpacity, Text, View } from '.'

export type SwipeRowBackButton = {
  key: string
  text: string
  type: 'primary' | 'danger'
  onPress: any
  isLoading?: boolean
}

type Props = {
  buttons: SwipeRowBackButton[]
  testID: string
}

export const SwipeRowBackMultipleButtons = (props: Props) => {
  const { buttons, testID } = props
  const [globalTheme] = useGlobal('globalTheme')

  const generateButtons = () => {
    const nodes: any[] = []

    for (const button of buttons) {
      const style = [s.swipeRowBackButton]
      const textStyle = [s.textWrapper]

      if (button.type === 'danger') {
        style.push(globalTheme.swipeRowBackButtonDanger)
        textStyle.push({ color: PV.Colors.white })
      } else {
        style.push(globalTheme.swipeRowBackButtonPrimary)
      }

      const node = (
        <PressableWithOpacity
          accessible={false}
          key={`${testID}_swipe_row_back_${button.key}`.prependTestId()}
          importantForAccessibility='no'
          onPress={button.onPress}
          style={style}
          testID={`${testID}_swipe_row_back`.prependTestId()}>
          {button.isLoading ? (
            <ActivityIndicator accessible={false} importantForAccessibility='no' size='large' testID={testID} />
          ) : (
            <Text accessible={false} importantForAccessibility='no' style={textStyle}>
              {button.text}
            </Text>
          )}
        </PressableWithOpacity>
      )
      nodes.push(node)
    }
    return nodes
  }

  return <View style={[s.swipeRowBack, globalTheme.swipeRowBackMultiple]}>{generateButtons()}</View>
}

const s = StyleSheet.create({
  swipeRowBack: {
    alignItems: 'flex-end',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  swipeRowBackButton: {
    height: '100%',
    justifyContent: 'center',
    maxWidth: 110,
    width: '100%'
  },
  textWrapper: {
    textAlign: 'center',
    fontWeight: PV.Fonts.weights.semibold
  }
})
