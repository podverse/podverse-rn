import React from 'react'
import { Pressable } from 'react-native'
import { PV } from '../resources'
import { table } from '../styles'
import { Text } from '.'

type TableCellProps = {
  children: any
  testIDPrefix: string
  testIDSuffix: string
  onPress?: any | null
}

type TableTextCellProps = {
  text?: string
  testIDPrefix: string
  testIDSuffix: string
  onPress?: any | null
}

export const TableCell = (props: TableCellProps) => {
  const { children, testIDPrefix, testIDSuffix, onPress = null } = props

  return (
    <Pressable
      onPress={onPress}
      style={table.cellWrapper}
      testID={`${testIDPrefix}_table_cell_wrapper_${testIDSuffix}`}>
      {children}
    </Pressable>
  )
}

export const TableTextCell = (props: TableTextCellProps) => {
  const { testIDPrefix, testIDSuffix, onPress = null, text = '' } = props

  return (
    <TableCell onPress={onPress} testIDPrefix={testIDPrefix} testIDSuffix={testIDSuffix}>
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        style={table.cellText}
        testID={`${testIDPrefix}_table_cell_text_${testIDSuffix}`}>
        {text}
      </Text>
    </TableCell>
  )
}
