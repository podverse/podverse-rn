import React from 'react'
import { StyleSheet } from 'react-native'
import { translate } from '../lib/i18n'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { button, core } from '../styles'
import { ActivityIndicator, Divider, Icon, SubscribeButton, Text, View } from './'

type Props = {
  createdBy?: string
  handleEditPress?: any
  handleToggleSubscribe?: any
  id?: string
  isLoading?: boolean
  isNotFound?: boolean
  isSubscribed?: boolean
  isSubscribing?: boolean
  itemCount: number
  lastUpdated: string
  testID: string
  title: string
}

export const PlaylistTableHeader = (props: Props) => {
  const {
    createdBy,
    handleEditPress,
    handleToggleSubscribe,
    id,
    isLoading,
    isNotFound,
    isSubscribed,
    isSubscribing,
    itemCount,
    lastUpdated,
    testID,
    title
  } = props

  return (
    <View>
      <View style={core.row}>
        {isLoading && (
          <View style={[styles.wrapper, core.view]}>
            <ActivityIndicator fillSpace={true} />
          </View>
        )}
        {!isLoading && !isNotFound && (
          <View style={[styles.wrapper, core.view]}>
            <View style={styles.textWrapper}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={1}
                style={styles.title}
                testID={`${testID}_title`}>
                {title}
              </Text>
              {!!createdBy && (
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.createdBy}
                  testID={`${testID}_created_by`}>
                  {translate('by')} {createdBy}
                </Text>
              )}
              <View style={styles.row}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary={true}
                  numberOfLines={1}
                  style={styles.itemCount}
                  testID={`${testID}_item_count`}>
                  {translate('items')} {itemCount}
                </Text>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  isSecondary={true}
                  style={styles.lastUpdated}
                  testID={`${testID}_last_updated`}>
                  {readableDate(lastUpdated)}
                </Text>
              </View>
            </View>
            {handleEditPress && (
              <Icon
                name='pencil-alt'
                onPress={() => handleEditPress(id)}
                size={26}
                style={button.iconOnlyMedium}
                testID={`${testID}_edit`}
              />
            )}
            {handleToggleSubscribe && (
              <SubscribeButton
                handleToggleSubscribe={handleToggleSubscribe}
                isSubscribed={isSubscribed}
                isSubscribing={isSubscribing}
                testID={testID}
              />
            )}
          </View>
        )}
        {!isLoading && isNotFound && (
          <View style={[styles.wrapper, core.view]}>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.notFoundText}>
              {translate('Playlist Not Found')}
            </Text>
          </View>
        )}
      </View>
      <Divider />
    </View>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    marginLeft: 8
  },
  createdBy: {
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 3
  },
  itemCount: {
    flex: 1,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 4
  },
  lastUpdated: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 4
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  row: {
    flexDirection: 'row'
  },
  textWrapper: {
    flex: 1,
    marginRight: 8
  },
  title: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.semibold
  },
  wrapper: {
    flexDirection: 'row',
    padding: 8
  }
})
