import { Platform, StyleSheet, Text, View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import Icon from 'react-native-vector-icons/FontAwesome5'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { darkTheme } from '../styles'

type Props = {
  color?: string
  items: any[]
  onValueChange?: any
  placeholder: any
  selectedItemKey: string | null
}

export const HeaderTitleSelector = (props: Props) => {
  const { color, items, onValueChange, placeholder, selectedItemKey } = props
  const selectedItem = items.find((x) => x.value === selectedItemKey) || {}
  const textStyle = [styles.text, darkTheme.text]

  if (color) {
    textStyle.push({ color })
  }

  const textNode = (
    <View
      accessible
      accessibilityHint={translate('ARIA HINT - tap to switch between queue and history')}
      accessibilityLabel={selectedItem.label || (placeholder && placeholder.label)}
      importantForAccessibility='yes'
      style={styles.wrapper}>
      <Text
        accessible={false}
        allowFontScaling={false}
        importantForAccessibility='no'
        style={textStyle}>
        {selectedItem.label || (placeholder && placeholder.label)}
      </Text>
      <Icon
        accessible={false}
        importantForAccessibility='no'
        color={color || darkTheme.text.color}
        name='angle-down'
        size={16}
        style={styles.angleDown} />
    </View>
  )

  return (
    <View>
      {onValueChange ? (
        <RNPickerSelect
          fixAndroidTouchableBug
          items={items}
          onValueChange={onValueChange}
          placeholder={placeholder}
          useNativeAndroidPickerStyle={false}
          value={selectedItemKey}>
          {textNode}
        </RNPickerSelect>
      ) : (
        textNode
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  angleDown: {
    paddingLeft: 4
  },
  text: {
    color: PV.Colors.white,
    fontSize: Platform.OS === 'ios' ? PV.Fonts.sizes.xl : PV.Fonts.sizes.md,
    fontWeight: 'bold'
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    marginHorizontal: 16
  }
})
