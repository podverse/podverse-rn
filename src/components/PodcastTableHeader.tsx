import { StyleSheet, Switch, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React, { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { removeHTMLFromString, testProps } from '../lib/utility'
import { PV } from '../resources'
import { core } from '../styles'
import { IndicatorDownload } from './IndicatorDownload'
import { ActivityIndicator, FastImage, SettingsButton, SubscribeButton, Text, View } from './'

type Props = {
  autoDownloadOn?: boolean
  description?: string
  handleNavigateToPodcastInfoScreen?: any
  handleToggleAutoDownload?: any
  handleToggleSettings?: any
  handleToggleSubscribe?: any
  isLoading?: boolean
  isNotFound?: boolean
  isSubscribed?: boolean
  isSubscribing?: boolean
  podcast?: any
  podcastImageUrl?: string
  podcastTitle: string
  showSettings?: boolean
  testID: string
}

export const PodcastTableHeader = (props: Props) => {
  const {
    autoDownloadOn,
    description,
    handleNavigateToPodcastInfoScreen,
    handleToggleAutoDownload,
    handleToggleSettings,
    handleToggleSubscribe,
    isLoading,
    isNotFound,
    isSubscribed,
    isSubscribing,
    podcastImageUrl,
    podcastTitle = translate('Untitled Podcast'),
    showSettings,
    testID
  } = props
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const titleNumberOfLines = [PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(fontScaleMode) ? 1 : 2

  const finalDescription = description ? removeHTMLFromString(description) : ''

  return (
    <View style={core.row}>
      {isLoading && (
        <View style={[styles.wrapper, core.view]}>
          <ActivityIndicator fillSpace testID={testID} />
        </View>
      )}
      <View style={{ flexDirection: 'column', flex: 1 }}>
        {!isLoading && !isNotFound && (
          <View style={styles.wrapper}>
            <FastImage source={podcastImageUrl} styles={styles.image} />
            <View style={styles.contentWrapper}>
              <View style={styles.contentWrapperTop}>
                <Text
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  numberOfLines={titleNumberOfLines}
                  style={styles.title}>
                  {podcastTitle}
                </Text>
                {isSubscribed && (
                  <SettingsButton
                    handleToggleSettings={handleToggleSettings}
                    showCheckmark={showSettings}
                    testID={`${testID}_settings`} />
                )}
              </View>
              <View style={styles.contentWrapperBottom}>
                {!!handleToggleSubscribe &&
                  <SubscribeButton
                    handleToggleSubscribe={handleToggleSubscribe}
                    isSubscribed={isSubscribed}
                    isSubscribing={isSubscribing}
                    testID={testID}
                  />
                }
                {isSubscribed && (
                  <View style={styles.autoDownloadContainer}>
                    <Text
                      fontSizeLargestScale={PV.Fonts.largeSizes.xs}
                      isSecondary
                      style={styles.autoDownloadText}>
                      {translate('Auto')}
                    </Text>
                    <IndicatorDownload style={{ marginLeft: 6 }} />
                    <Switch
                      onValueChange={handleToggleAutoDownload}
                      style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }], marginLeft: 5 }}
                      trackColor={{ true: PV.Colors.brandBlueLight, false: PV.Colors.grayLightest }}
                      {...(testID ? testProps(`${testID}_auto_dl_switch`) : {})}
                      value={autoDownloadOn}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        {!isLoading && !isNotFound && !!finalDescription && (
          <View style={styles.descriptionWrapper}>
            <TouchableWithoutFeedback onPress={handleNavigateToPodcastInfoScreen}>
              <RNView>
                <Text
                  numberOfLines={2}
                  style={styles.descriptionText}
                  testID={`${testID}_description_text`}>{finalDescription}</Text>
                {/* <Text
                  numberOfLines={1}
                  style={styles.descriptionText}
                  testID={`${testID}_description_text_more`}>{translate('more-ellipsis')}</Text> */}
              </RNView>
            </TouchableWithoutFeedback>
          </View>
        )}
        {!isLoading && isNotFound && (
          <View style={[styles.wrapper, core.view]}>
            <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.title}>
              {translate('Podcast Not Found')}
            </Text>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 0,
    flexDirection: 'row',
    minHeight: PV.Table.cells.podcast.wrapper.height,
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: PV.Colors.velvet
  },
  autoDownloadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  autoDownloadText: {
    fontSize: PV.Fonts.sizes.xs,
    color: PV.Colors.grayLight,
    textAlign: 'right'
  },
  image: {
    height: PV.Table.cells.podcast.image.height,
    width: PV.Table.cells.podcast.image.width,
    marginRight: 16
  },
  contentWrapper: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between'
  },
  contentWrapperBottom: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8
  },
  contentWrapperTop: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between'
  },
  descriptionWrapper: {
    flex: 0,
    paddingBottom: 15,
    backgroundColor: PV.Colors.velvet
  },
  descriptionText: {
    fontSize: PV.Fonts.sizes.sm,
    marginHorizontal: 8
  },
  title: {
    flexWrap: 'wrap',
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    maxWidth: 250
  }
})
