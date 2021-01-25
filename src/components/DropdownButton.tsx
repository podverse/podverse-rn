import React from 'react'
import { TouchableWithoutFeedback, View } from 'react-native'
import { useGlobal } from 'reactn'
import { Icon, Text } from '.'
import { translate } from '../lib/i18n'
import { PV } from '../resources'

export const DropdownButton = (props: any) => {
  const { hideFilter, onPress } = props
  const [globalTheme] = useGlobal('globalTheme')
  const dropdownStyle = hideFilter ? { opacity: 0.0 } : {}

  return (
    <TouchableWithoutFeedback disabled={hideFilter} onPress={onPress}>
      <View style={[styles.dropdownButton, dropdownStyle]}>
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          numberOfLines={1}
          style={[styles.dropdownButtonText, globalTheme.dropdownButtonText]}>
          {translate('Filter')}
        </Text>
        <Icon name='angle-down' size={14} style={[styles.dropdownButtonIcon, globalTheme.dropdownButtonIcon]} />
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = {
  divider: {
    height: 1
  },
  dropdownButton: {
    alignItems: 'center',
    backgroundColor: PV.Colors.velvet,
    borderColor: PV.Colors.brandBlueLight,
    borderRadius: 100,
    borderWidth: 2,
    flexDirection: 'row',
    flex: 0,
    justifyContent: 'center',
    height: PV.Table.sectionHeader.height - 6,
    paddingHorizontal: 16
  },
  dropdownButtonIcon: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl
  },
  dropdownButtonText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold,
    paddingRight: 16
  }
}
