import { FlatList, StyleSheet } from 'react-native'
import React, { getGlobal } from 'reactn'
import { PV } from '../resources'
import { Divider, Icon, Text, View } from './'

export const ComparisonTable = (props: any) => {
  const { column1Title, column2Title, data, mainTitle } = props
  const { fontScaleMode, globalTheme } = getGlobal()

  const tableHeaderTextLeftStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
    [styles.tableHeaderTextLeft, { fontSize: 7 }] :
    [styles.tableHeaderTextLeft]
  const tableHeaderTextRightStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
    [styles.tableHeaderTextRight, { fontSize: 7 }] :
    [styles.tableHeaderTextRight]
  const columnTextStyle = PV.Fonts.fontScale.largest === fontScaleMode ?
    [styles.columnText, { fontSize: 7 }] :
    [styles.columnText]

  return (
    <View style={styles.wrapper}>
      <View style={[styles.tableHeaderRow, globalTheme.tableSectionHeader]}>
        <Text
          numberOfLines={1}
          style={[
            tableHeaderTextLeftStyle,
            globalTheme.tableSectionHeaderText
          ]}>
          {mainTitle}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            tableHeaderTextRightStyle,
            globalTheme.tableSectionHeaderText
          ]}>
          {column1Title}
        </Text>
        <Text
          numberOfLines={1}
          style={[
            tableHeaderTextRightStyle,
            globalTheme.tableSectionHeaderText
          ]}>
          {column2Title}
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, index) => item.text + index}
        renderItem={({ item }) => (
          <View key={item.text} style={styles.tableRow}>
            <View style={styles.columnTextWrapper}>
              <Text style={columnTextStyle}>{item.text}</Text>
            </View>
            <View style={styles.columnIcon}>
              {item.column1 && (
                <Icon
                  name={item.isSmile ? 'smile' : 'check'}
                  size={26}
                  style={styles.icon}
                />
              )}
            </View>
            <View style={styles.columnIcon}>
              {item.column2 && (
                <Icon
                  name={item.isSmile ? 'smile' : 'check'}
                  size={26}
                  style={styles.icon}
                />
              )}
            </View>
            <Divider />
          </View>
        )}
      />
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
    fontSize: PV.Fonts.sizes.md,
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
    alignItems: 'center',
    flex: 0,
    flexDirection: 'row',
    minHeight: 40
  },
  tableHeaderTextLeft: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    marginHorizontal: 8
  },
  tableHeaderTextRight: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    textAlign: 'center',
    width: 90
  },
  tableRow: {
    flexDirection: 'row',
    minHeight: 60,
    justifyContent: 'center'
  },
  wrapper: {
    flex: 1
  }
})
