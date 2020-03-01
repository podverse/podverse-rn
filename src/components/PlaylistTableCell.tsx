import React from 'react'
import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import { PV } from '../resources'
import { ActivityIndicator, Text, View } from './'

type Props = {
  createdBy?: string
  hasZebraStripe?: boolean
  isSaving?: boolean
  itemCount?: number
  onPress?: any
  title?: string
}

export class PlaylistTableCell extends React.PureComponent<Props> {
  render() {
    const {
      createdBy,
      hasZebraStripe,
      isSaving,
      itemCount = 0,
      onPress,
      title = 'untitled playlist'
    } = this.props

    const wrapperTopStyles = [styles.wrapperTop]
    if (createdBy) wrapperTopStyles.push(styles.wrapperTopWithCreatedBy)

    return (
      <TouchableWithoutFeedback onPress={onPress}>
        <View
          hasZebraStripe={hasZebraStripe}
          style={styles.wrapper}>
          <RNView style={wrapperTopStyles}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.md}
              numberOfLines={1}
              style={styles.title}>
              {title}
            </Text>
            {isSaving ? (
              <ActivityIndicator styles={styles.activityIndicator} />
            ) : (
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary={true}
                style={styles.itemCount}>
                items: {itemCount}
              </Text>
            )}
          </RNView>
          {!!createdBy && (
            <RNView style={styles.wrapperBottom}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                isSecondary={true}
                style={styles.createdBy}>
                by: {createdBy}
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
    height: PV.Table.cells.standard.height,
    justifyContent: 'space-between',
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
