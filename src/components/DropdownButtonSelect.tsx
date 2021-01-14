import React from 'react'
import RNPickerSelect from 'react-native-picker-select'
import { useGlobal } from 'reactn'
import { Icon, Text, View } from '.'
import { PV } from '../resources'

export const DropdownButtonSelect = (props: any) => {
  const { items, label, onValueChange, placeholder, testID, value } = props
  const [globalTheme] = useGlobal('globalTheme')
  return (
    <RNPickerSelect
      items={items}
      onValueChange={onValueChange}
      placeholder={placeholder}
      style={{ viewContainer: { alignSelf: 'center' } }}
      touchableWrapperProps={{ testID: `${testID}_dropdown_button_select` }}
      useNativeAndroidPickerStyle={false}
      value={value}>
      <View style={styles.dropdownButton}>
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          numberOfLines={1}
          style={[styles.dropdownButtonText, globalTheme.dropdownButtonText]}
          testID={`${testID}_dropdown_button_select_text`}>
          {label}
        </Text>
        <Icon
          name='angle-down'
          size={14}
          style={[styles.dropdownButtonIcon, globalTheme.dropdownButtonIcon]}
          testID={`${testID}_dropdown_button_select`}
        />
      </View>
    </RNPickerSelect>
  )
}

const styles = {
  divider: {
    height: 1
  },
  dropdownButton: {
    alignItems: 'center',
    borderColor: PV.Colors.brandBlueLight,
    borderRadius: 100,
    borderWidth: 2,
    flexDirection: 'row',
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
