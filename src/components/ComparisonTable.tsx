import { FlatList, StyleSheet } from 'react-native'
import React, { useGlobal } from 'reactn'
import { PV } from '../resources'
import { Divider, Icon, Text, View, PVVideoLink } from './'

type TableLineItem = {
  /**
   * text: The row heading
   */
  text: string
  videoUrl?: string
  column1: boolean
  column2: boolean
  accessibilityLabel: string
}

type ComparisonTableProps = {
  column1Title: string
  column2Title: string
  data: TableLineItem[] | []
  mainTitle: string
  mainTitleAccessibilityHint: string
  navigation: any
}

export const ComparisonTable = (props: ComparisonTableProps) => {
  const { column1Title, column2Title, data, mainTitle, mainTitleAccessibilityHint, navigation } = props
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
            <Divider />
            <View accessible accessibilityLabel={item.accessibilityLabel} key={item.text} style={styles.tableRow}>
              <View accessible={false} style={styles.columnTextWrapper}>
                <View accessible={false} style={styles.columnText}>
                  <PVVideoLink title={item.text} navigation={navigation} url={item.videoUrl} testID='' />
                </View>
              </View>
              <View accessible={false} style={styles.columnIcon}>
                {item.column1 && (
                  <Icon accessible={false} name={item.isSmile ? 'smile' : 'check'} size={26} style={styles.icon} />
                )}
              </View>
              <View accessible={false} style={styles.columnIcon}>
                {item.column2 && (
                  <Icon accessible={false} name={item.isSmile ? 'smile' : 'check'} size={26} style={styles.icon} />
                )}
              </View>
            </View>
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
    paddingVertical: 12
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
    minHeight: 48
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
