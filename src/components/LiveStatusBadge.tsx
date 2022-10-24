import React from 'react'
import { useGlobal } from 'reactn'
import { StyleSheet, View } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Text } from '.'

type Props = {
  testID?: string
  wrapperStyles?: any
}

export const LiveStatusBadge = (props: Props) => {
  const { testID, wrapperStyles = {} } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View
      accessible={false}
      importantForAccessibility='no-hide-descendants'
      style={[styles.badge, globalTheme.liveStatusBadge, wrapperStyles]}>
      <Text
        accessible={false}
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        numberOfLines={1}
        style={[styles.text, globalTheme.liveStatusBadgeText]}
        {...(testID ? { testID: `${testID}_live_status_badge` } : {})}>
        {translate('Live')}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    borderRadius: 100,
    borderWidth: 2,
    flexDirection: 'row',
    flex: 0,
    justifyContent: 'center',
    height: PV.Table.sectionHeader.height - 6,
    marginLeft: 4,
    marginTop: 3,
    paddingHorizontal: 16
  },
  text: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    marginBottom: 3
  }
})
