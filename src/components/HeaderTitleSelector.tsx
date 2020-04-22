import { Platform, StyleSheet, Text, View } from 'react-native'
import RNPickerSelect from 'react-native-picker-select'
import Icon from 'react-native-vector-icons/FontAwesome5'
import React, { useGlobal } from 'reactn'
import { PV } from '../resources'
import { darkTheme } from '../styles'

type Props = {
  items: any[]
  onValueChange?: any
  placeholder: any
  selectedItemKey: string | null
}

export const HeaderTitleSelector = (props: Props) => {
  const { items, onValueChange, placeholder, selectedItemKey } = props
  const selectedItem = items.find((x) => x.value === selectedItemKey) || {}
  const [fontScaleMode] = useGlobal('fontScaleMode')
  const textStyle = [styles.text, darkTheme.text]

  if (fontScaleMode === PV.Fonts.fontScale.larger) {
    textStyle.push({ fontSize: PV.Fonts.largeSizes.xl })
  } else if (fontScaleMode === PV.Fonts.fontScale.largest) {
    textStyle.push({ fontSize: PV.Fonts.largeSizes.md })
  }

  const textNode = (
    <View style={styles.wrapper}>
      <Text style={textStyle}>{selectedItem.label || (placeholder && placeholder.label)}</Text>
      <Icon color={darkTheme.text.color} name='angle-down' size={16} style={styles.angleDown} />
    </View>
  )

  return (
    <View>
      {onValueChange ? (
        <RNPickerSelect
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
    fontSize: Platform.os === 'ios' ? PV.Fonts.sizes.xl : PV.Fonts.sizes.md,
    fontWeight: 'bold'
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 44,
    marginHorizontal: 16
  }
})
