import React from 'react'
import { ScrollView } from 'react-native'
import { useGlobal } from 'reactn'

type Props = {
  bounces?: boolean
  children: any
  contentContainerStyle?: any
  decelerationRate?: string
  fillSpace?: boolean
  horizontal?: boolean
  onMomentumScrollEnd?: any
  onScrollEndDrag?: any
  pagingEnabled?: boolean
  scrollEnabled?: boolean
  scrollViewRef?: any
  showsHorizontalScrollIndicator?: boolean
  snapToInterval?: number
  snapToOffsets?: number
  snapToStart?: boolean
  style?: any
  testID?: string
  transparent?: boolean
}

export const PVScrollView = (props: Props) => {
  const { contentContainerStyle, scrollViewRef, testID } = props
  const [globalTheme] = useGlobal('globalTheme')

  const styles = [props.style, globalTheme.view]
  if (props.transparent) {
    styles.push({ backgroundColor: 'transparent' })
  }

  const contentContainerStyles = contentContainerStyle ? [contentContainerStyle] : []
  if (props.fillSpace) {
    contentContainerStyles.push({ flex: 1 })
  }

  return (
    <ScrollView
      {...props}
      contentContainerStyle={contentContainerStyles}
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      style={styles}
      testID={testID ? testID.prependTestId() : ''}>
      {props.children}
    </ScrollView>
  )
}
