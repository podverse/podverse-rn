import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Icon } from 'react-native-elements'
import RNPickerSelect from 'react-native-picker-select'
import { PV } from '../resources'

type Props = {
  items: any[]
  onValueChange?: any
  placeholder: any
  selectedItemKey: string | null
}

export const HeaderTitleSelector = (props: Props) => {
  const { items, onValueChange, placeholder, selectedItemKey } = props
  const selectedItem = items.find((x) => x.value === selectedItemKey) || {}

  const textNode = (
    <View style={styles.wrapper}>
      <Text style={styles.text}>
        {selectedItem.label || (placeholder && placeholder.label)}
      </Text>
      <Icon
        color='#fff'
        iconStyle={styles.closeButton}
        name='angle-down'
        size={16}
        type='font-awesome'
        underlayColor={PV.Colors.brandColor} />
    </View>
  )

  return (
    <View>
      {
        onValueChange ?
          <RNPickerSelect
            items={items}
            onValueChange={onValueChange}
            placeholder={placeholder}
            value={selectedItemKey}>
            {textNode}
          </RNPickerSelect> : textNode
      }
    </View>
  )
}

const styles = StyleSheet.create({
  closeButton: {
    paddingLeft: 4,
    paddingTop: 2
  },
  text: {
    color: PV.Colors.white,
    fontSize: 17,
    fontWeight: 'bold'
  },
  wrapper: {
    flexDirection: 'row',
    marginTop: 6,
    paddingVertical: 6
  }
})
