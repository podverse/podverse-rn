import { FlatList, StyleSheet } from 'react-native'
import React, { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Divider, Icon, Text, View } from './'

export const ComparisonTable = (props: any) => {
  const { column1Title, column2Title, data, mainTitle, mainTitleAccessibilityHint } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <View style={styles.wrapper}>
      <View style={[styles.tableHeaderRow, globalTheme.tableSectionHeader]}>
        <Text
          accessibilityHint={mainTitleAccessibilityHint}
          accessibilityLabel={mainTitle}
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          numberOfLines={1}
          style={[styles.tableHeaderTextLeft, globalTheme.tableSectionHeaderText]}>
          {mainTitle}
        </Text>
        <Text
          accessible={false}
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          importantForAccessibility='no'
          numberOfLines={1}
          style={[styles.tableHeaderTextRight, globalTheme.tableSectionHeaderText]}>
          {column1Title}
        </Text>
        <Text
          accessible={false}
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          importantForAccessibility='no'
          numberOfLines={1}
          style={[styles.tableHeaderTextRight, globalTheme.tableSectionHeaderText]}>
          {column2Title}
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item: any, index: number) => `comparisonTable${index}`}
        renderItem={({ item }) => (
          <>
            <View
              accessible
              accessibilityLabel={item.accessibilityLabel}
              key={item.text}
              style={styles.tableRow}>
              <View accessible={false} style={styles.columnTextWrapper}>
                <Text accessible={false} fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.columnText}>
                  {item.text}
                </Text>
              </View>
              <View accessible={false} style={styles.columnIcon}>
                {item.column1 && (
                  <Icon
                    accessible={false}
                    name={item.isSmile ? 'smile' : 'check'}
                    size={26}
                    style={styles.icon} />
                )}
              </View>
              <View accessible={false} style={styles.columnIcon}>
                {item.column2 && (
                  <Icon
                    accessible={false}
                    name={item.isSmile ? 'smile' : 'check'}
                    size={26}
                    style={styles.icon} />
                )}
              </View>
            </View>
            <Divider />
          </>
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
    fontSize: PV.Fonts.sizes.xl,
    marginLeft: 8,
    paddingVertical: 4
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
