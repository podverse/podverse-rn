import React from 'react'
import { PV } from '../resources'
import { table } from '../styles'
import { Text, View } from './'

type Props = {
  children: any
  testIDPrefix: string
  testIDSuffix: string
}

export const TableCell = (props: Props) => {
  const { children, testIDPrefix, testIDSuffix } = props

  return (
    <View
      style={table.cellWrapper}
      testID={`${testIDPrefix}_table_cell_wrapper_${testIDSuffix}`}>
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        style={table.cellText}
        testID={`${testIDPrefix}_table_cell_text_${testIDSuffix}`}>
        {children}
      </Text>
    </View>
  )
}
