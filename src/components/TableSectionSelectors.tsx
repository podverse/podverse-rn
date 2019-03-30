import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Divider, Text } from './'

export const TableSectionSelectors = (props: any) => {
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View>
      <Divider noMargin={true} />
      <View
        {...props}
        style={[styles.tableSectionHeader, globalTheme.tableSectionHeader]}>
        <TouchableOpacity style={styles.tableSectionHeaderButton}>
          <Text style={[styles.tableSectionHeaderTextLeft, globalTheme.tableSectionHeaderText]}>
            subscribed &#9662;
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tableSectionHeaderButton}>
          <Text style={[styles.tableSectionHeaderTextRight, globalTheme.tableSectionHeaderText]}>
            most recent &#9662;
          </Text>
        </TouchableOpacity>
      </View>
      <Divider noMargin={true} />
    </View>
  )
}

const styles = {
  tableSectionHeader: {
    alignItems: 'stretch',
    flexDirection: 'row',
    height: 40,
    justifyContent: 'space-between',
    paddingLeft: 8,
    paddingRight: 8
  },
  tableSectionHeaderButton: {
    justifyContent: 'center'
  },
  tableSectionHeaderTextLeft: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    paddingRight: 8
  },
  tableSectionHeaderTextRight: {
    fontSize: PV.Fonts.sizes.xl,
    paddingLeft: 8
  }
}
