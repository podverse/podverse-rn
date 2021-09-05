import React from 'react'
import RNPickerSelect from 'react-native-picker-select'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Icon, Text, View } from '.'

export const DropdownButtonSelect = (props: any) => {
  const { accessibilityHint, helpText, hideHelpTextInAccessibility, items,
    label, onValueChange, placeholder, testID, value, wrapperStyle } = props
  const [globalTheme] = useGlobal('globalTheme')
  const accessibilityLabel = `${label}${helpText && !hideHelpTextInAccessibility ? `, ${helpText}` : ''}`

  return (
    <View
      style={[styles.dropdownWrapper, wrapperStyle]}
      transparent>
      <RNPickerSelect
        items={items}
        onValueChange={onValueChange}
        placeholder={placeholder}
        style={{ viewContainer: { alignSelf: 'center' } }}
        touchableWrapperProps={{
          accessible: true,
          accessibilityHint,
          accessibilityLabel,
          testID: `${testID}_dropdown_button_select`.prependTestId()
        }}
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
      <Text
        accessible={false}
        accessibilityLabel=''
        importantForAccessibility='no'
        style={styles.dropdownHelpText}>
        {helpText}
      </Text>
    </View>
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
  },
  dropdownHelpText: {
    fontSize: PV.Fonts.sizes.tiny,
    maxWidth: '60%',
    flexWrap: 'wrap'
  },
  dropdownWrapper: {
    alignItems: 'center',
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    minHeight: PV.Table.sectionHeader.height,
    paddingHorizontal: 8
  }
}
