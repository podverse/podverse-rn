import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import { translate } from '../lib/i18n'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { ActivityIndicator, Text, View } from './'

type Props = {
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
      createdBy = translate('anonymous'),
      hasZebraStripe,
      isSaving,
      itemCount = 0,
      onPress,
      testID,
      title = translate('Untitled Playlist')
    } = this.props

    const wrapperTopStyles = [styles.wrapperTop]
    if (createdBy) wrapperTopStyles.push(styles.wrapperTopWithCreatedBy)

    return (
      <TouchableWithoutFeedback onPress={onPress} {...(testID ? testProps(testID) : {})}>
        <View hasZebraStripe={hasZebraStripe} style={styles.wrapper}>
          <RNView style={wrapperTopStyles}>
            {title && (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={1}
                style={styles.title}
                testID={`${testID}_title`}>
                {title.trim()}
              </Text>
            )}
            {isSaving ? (
              <ActivityIndicator styles={styles.activityIndicator} />
            ) : (
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
            <RNView style={styles.wrapperBottom}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary
                style={styles.createdBy}
                testID={`${testID}_created_by`}>
                {translate('by')} {createdBy}
              </Text>
            </RNView>
          )}
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
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    marginBottom: 'auto',
    marginTop: 'auto'
  },
  title: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold,
    marginBottom: 'auto',
    marginTop: 'auto'
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: PV.Table.cells.standard.height,
    paddingLeft: 8,
    paddingRight: 8
  },
  wrapperBottom: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row'
  },
  wrapperTop: {
    flex: 1,
    flexDirection: 'row'
  },
  wrapperTopWithCreatedBy: {
    paddingTop: 5
  }
})
