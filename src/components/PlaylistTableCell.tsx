import React, { getGlobal } from 'reactn'
import { Pressable, StyleSheet, View as RNView } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { ActivityIndicator, Icon, Text, View } from './'

type Props = {
  accessibilityHint?: string
  createdBy?: string
  hasZebraStripe?: boolean
  isSaving?: boolean
  itemCount?: number
  itemId?: string
  itemsOrder?: string[]
  onPress?: any
  showCheckmarks?: boolean
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
      itemId,
      itemsOrder,
      onPress,
      showCheckmarks,
      testID,
      title = translate('Untitled Playlist')
    } = this.props
    const globalTheme = getGlobal()?.globalTheme

    const wrapperLeftStyles = [styles.wrapperLeft]
    if (createdBy) wrapperLeftStyles.push(styles.wrapperLeftWithCreatedBy)

    const trimmedTitle = title.trim()
    const itemsCount = `${translate('items')} ${itemCount}`
    const byText = `${translate('by')} ${createdBy}`
    const accessibilityLabel = `${trimmedTitle}, ${itemsCount} ${createdBy ? `,${byText}` : ''}`
    const isAdded = itemId && itemsOrder?.includes(itemId)
    const addedIndicatorStyles = [styles.addedIndicator, globalTheme.buttonActive]
    
    return (
      <Pressable
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
              {!isSaving && (
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary
                  style={styles.itemCount}
                  testID={`${testID}_item_count`}>
                  {translate('items')} {itemCount}
                </Text>
              )}
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
          {
            showCheckmarks && (
              <RNView style={styles.wrapperRight}>
                {isSaving && <ActivityIndicator styles={styles.activityIndicator} testID={testID} />}
                {!isSaving && isAdded && <Icon isSecondary name={'check-circle'}
                  size={21} style={addedIndicatorStyles} testID={`${testID}_is_added`} />}
                {!isSaving && !isAdded && <Icon isSecondary name={'circle'}
                  size={21} style={addedIndicatorStyles} testID={`${testID}_is_not_added`} />}
              </RNView>
            )
          }
        </View>
      </Pressable>
    )
  }
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 0
  },
  addedIndicator: {
    paddingHorizontal: 12
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
    minHeight: PV.Table.cells.standard.height + 4,
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
