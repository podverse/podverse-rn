import React from 'react'
import { AccessibilityRole, TouchableOpacity, View } from 'react-native'
import { PV } from '../resources'
import { table } from '../styles'
import { Divider, Text, Icon } from '.'

type TableCellProps = {
  accessibilityHint?: string
  accessibilityLabel?: string
  accessibilityRole?: AccessibilityRole
  children: any
  hideChevron?: boolean
  includeDivider?: boolean
  onPress?: any | null
  testIDPrefix: string
  testIDSuffix: string
}

type TableTextCellProps = {
  accessibilityHint?: string
  accessibilityLabel?: string
  hideChevron?: boolean
  onPress?: any | null
  testIDPrefix: string
  testIDSuffix: string
  text?: string
}

export const TableCell = (props: TableCellProps) => {
  const { accessibilityHint, accessibilityLabel, accessibilityRole, children,
    hideChevron = true, includeDivider, testIDPrefix, testIDSuffix,
    onPress = null } = props
  
  return (
    <>
      <TouchableOpacity
        accessible
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole={accessibilityRole}
        onPress={onPress}
        style={table.cellWrapper}
        testID={`${testIDPrefix}_table_cell_wrapper${testIDSuffix ? `_${testIDSuffix}` : ''}`}>
          <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
            <View style={{flexDirection:"row", alignItems:"center"}}>{children}</View>
            {!hideChevron &&
              <Icon
                style={{marginRight:20}}
                testID={`${testIDPrefix}_table_cell_chevron${testIDSuffix ? `_${testIDSuffix}` : ''}`.prependTestId()}
                name="angle-right"
                size={30}/>
            }
          </View>
      </TouchableOpacity>
      {includeDivider && <Divider />}
    </>
  )
}

export const TableTextCell = (props: TableTextCellProps) => {
  const { accessibilityHint, accessibilityLabel, hideChevron = true, onPress = null,
    testIDPrefix, testIDSuffix, text = '' } = props

  return (
    <TableCell
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      hideChevron={hideChevron}
      onPress={onPress}
      testIDPrefix={testIDPrefix}
      testIDSuffix={testIDSuffix}
      >
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        style={table.cellText}
        testID={`${testIDPrefix}_table_cell_text${testIDSuffix ? `_${testIDSuffix}` : ''}`}>
        {text}
      </Text>

    </TableCell>
  )
}
