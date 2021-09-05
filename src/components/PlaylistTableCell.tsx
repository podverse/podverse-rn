import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { ActivityIndicator, Text, View } from './'

type Props = {
  accessibilityHint?: string
  createdBy?: string
  hasZebraStripe?: boolean
  isSaving?: boolean
  itemCount?: number
  onPress?: any
  testID: string
  title?: string
}

export class PlaylistTableCell extends React.PureComponent<Props> {
  render() {
    const {
      accessibilityHint,
      createdBy,
      hasZebraStripe,
      isSaving,
      itemCount = 0,
      onPress,
      testID,
      title = translate('Untitled Playlist')
    } = this.props

    const wrapperLeftStyles = [styles.wrapperLeft]
    if (createdBy) wrapperLeftStyles.push(styles.wrapperLeftWithCreatedBy)

    const trimmedTitle = title.trim()
    const itemsCount = `${translate('items')} ${itemCount}`
    const byText = `${translate('by')} ${createdBy}`
    const accessibilityLabel = `${trimmedTitle}, ${itemsCount} ${createdBy ? `,${byText}` : ''}`

    return (
      <TouchableWithoutFeedback
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        {...(testID ? { testID: testID.prependTestId() } : {})}>
        <View hasZebraStripe={hasZebraStripe} style={styles.wrapper}>
          <RNView style={wrapperLeftStyles}>
            <RNView style={styles.wrapperLeftTop}>
              {!!title && (
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={1}
                  style={styles.title}
                  testID={`${testID}_title`}>
                  {title.trim()}
                </Text>
              )}
              {!isSaving &&
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary
                  style={styles.itemCount}
                  testID={`${testID}_item_count`}>
                  {translate('items')} {itemCount}
                </Text>
              }
            </RNView>
            {!!createdBy && (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary
                style={styles.createdBy}
                testID={`${testID}_created_by`}>
                {translate('by')} {createdBy}
              </Text>
            )}
          </RNView>
          <RNView style={styles.wrapperRight}>
            {isSaving && <ActivityIndicator styles={styles.activityIndicator} testID={testID} />}
          </RNView>
        </View>
      </TouchableWithoutFeedback>
    )
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 0
  },
  createdBy: {
    alignContent: 'flex-start',
    flex: 1,
    textAlign: 'left'
  },
  itemCount: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    marginLeft: 12
  },
  title: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    marginBottom: 'auto',
    marginTop: 'auto'
  },
  wrapper: {
    flexDirection: 'row',
    minHeight: PV.Table.cells.standard.height,
    paddingLeft: 8,
    paddingRight: 8,
    alignItems: 'center'
  },
  wrapperLeft: {
    flex: 1,
    flexDirection: 'column'
  },
  wrapperLeftTop: {
    flexDirection: 'row'
  },
  wrapperLeftWithCreatedBy: {
    paddingTop: 5
  },
  wrapperRight: {
    flex: 0,
    justifyContent: 'center',
    marginLeft: 12
  }
})
