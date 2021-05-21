import React from 'react'
import { Pressable, View } from 'react-native'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { table } from '../styles'
import { Text, Icon } from '.'

type TableCellProps = {
  children: any
  testIDPrefix: string
  testIDSuffix: string
  onPress?: any | null
  hideChevron?: boolean
}

type TableTextCellProps = {
  text?: string
  testIDPrefix: string
  testIDSuffix: string
  onPress?: any | null
  hideChevron?: boolean
}

export const TableCell = (props: TableCellProps) => {
  const { children, testIDPrefix, testIDSuffix, onPress = null, hideChevron = true } = props

  console.log({...testProps(`${testIDPrefix}_table_cell_wrapper${testIDSuffix ? `_${testIDSuffix}` : ''}`)})

  return (
    <Pressable
      onPress={onPress}
      style={table.cellWrapper}
      {...testProps(`${testIDPrefix}_table_cell_wrapper${testIDSuffix ? `_${testIDSuffix}` : ''}`)}>
        <View style={{flexDirection:"row", alignItems:"center", justifyContent:"space-between"}}>
          <View style={{flexDirection:"row", alignItems:"center"}}>{children}</View>
          {!hideChevron &&
            <Icon
              style={{marginRight:20}}
              testID={`${testIDPrefix}_table_cell_chevron${testIDSuffix ? `_${testIDSuffix}` : ''}`}
              name="angle-right"
              size={30}/>
          }
        </View>
    </Pressable>
  )
}

export const TableTextCell = (props: TableTextCellProps) => {
  const { testIDPrefix, testIDSuffix, onPress = null, text = '', hideChevron = true } = props

  return (
    <TableCell onPress={onPress} testIDPrefix={testIDPrefix} testIDSuffix={testIDSuffix} hideChevron={hideChevron}>
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        style={table.cellText}
        testID={`${testIDPrefix}_table_cell_text${testIDSuffix ? `_${testIDSuffix}` : ''}`}>
        {text}
      </Text>
    </TableCell>
  )
}
