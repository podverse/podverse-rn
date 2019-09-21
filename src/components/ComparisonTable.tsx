import React from 'react'
import { FlatList, StyleSheet } from 'react-native'
import { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Divider, Icon, Text, View } from './'

export const ComparisonTable = (props: any) => {
  const { column1Title, column2Title, data, mainTitle } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View style={styles.wrapper}>
      <View style={[styles.tableHeaderRow, globalTheme.tableSectionHeader]}>
        <Text style={[styles.tableHeaderTextLeft, globalTheme.tableSectionHeaderText]}>{mainTitle}</Text>
        <Text style={[styles.tableHeaderTextRight, globalTheme.tableSectionHeaderText]}>{column1Title}</Text>
        <Text style={[styles.tableHeaderTextRight, globalTheme.tableSectionHeaderText]}>{column2Title}</Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.text + index}
        renderItem={({ item }) => (
          <View
            key={item.text}
            style={styles.tableRow}>
            <View style={styles.columnTextWrapper}>
              <Text style={styles.columnText}>{item.text}</Text>
            </View>
            <View style={styles.columnIcon}>
              {
                item.column1 &&
                  <Icon
                    name={item.isSmile ? 'smile' : 'check'}
                    size={26}
                    style={styles.icon} />
              }
            </View>
            <View style={styles.columnIcon}>
              {
                item.column2 &&
                  <Icon
                    name={item.isSmile ? 'smile' : 'check'}
                    size={26}
                    style={styles.icon} />
              }
            </View>
            <Divider />
          </View>
        )} />
    </View>
  )
}

const styles = StyleSheet.create({
  columnIcon: {
    alignItems: 'center',
    borderLeftWidth: 1,
    flex: 0,
    flexBasis: 90,
    justifyContent: 'center'
  },
  columnText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    marginLeft: 8
  },
  columnTextWrapper: {
    flex: 1,
    justifyContent: 'center'
  },
  icon: {
    paddingVertical: 12
  },
  tableHeaderRow: {
    flex: 0,
    flexDirection: 'row',
    height: 40
  },
  tableHeaderTextLeft: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: 40,
    marginHorizontal: 8
  },
  tableHeaderTextRight: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: 40,
    textAlign: 'center',
    width: 90
  },
  tableRow: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center'
  },
  wrapper: {
    flex: 1,
    paddingBottom: 8
  }
})
