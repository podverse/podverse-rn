import { StyleSheet, Switch } from 'react-native'
import React, { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { core } from '../styles'
import { ActivityIndicator, FastImage, SettingsButton, SubscribeButton, Text, View } from './'

type Props = {
  autoDownloadOn?: boolean
  handleToggleAutoDownload?: any
  handleToggleSettings: any
  handleToggleSubscribe: any
  isLoading?: boolean
  isNotFound?: boolean
  isSubscribed?: boolean
  isSubscribing?: boolean
  podcastImageUrl?: string
  podcastTitle: string
  showSettings?: boolean
  testID: string
}

export const PodcastTableHeader = (props: Props) => {
  const {
    autoDownloadOn,
    handleToggleAutoDownload,
    handleToggleSettings,
    handleToggleSubscribe,
    isLoading,
    isNotFound,
    isSubscribed,
    isSubscribing,
    podcastImageUrl,
    podcastTitle = translate('untitled podcast'),
    showSettings,
    testID
  } = props
  const [fontScaleMode] = useGlobal('fontScaleMode')

  const titleNumberOfLines = [PV.Fonts.fontScale.larger, PV.Fonts.fontScale.largest].includes(fontScaleMode) ? 1 : 2

  return (
    <View style={core.row}>
      {isLoading && (
        <View style={[styles.wrapper, core.view]}>
          <ActivityIndicator />
        </View>
      )}
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
            </View>
            <View style={styles.contentWrapperBottom}>
              {isSubscribed && (
                <View style={[styles.contentWrapperBottomRow, { marginBottom: 5 }]}>
                  <Text
                    fontSizeLargestScale={PV.Fonts.largeSizes.xs}
                    isSecondary={true}
                    style={styles.autoDownloadText}>
                    {translate('Auto download episodes')}
                  </Text>
                  <Switch
                    onValueChange={handleToggleAutoDownload}
                    value={autoDownloadOn}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                    trackColor={{ true: PV.Colors.brandBlueLight, false: PV.Colors.grayLightest }}
                  />
                </View>
              )}
              <View style={[styles.contentWrapperBottomRow, { marginRight: 12 }]}>
                <SubscribeButton
                  handleToggleSubscribe={handleToggleSubscribe}
                  isSubscribed={isSubscribed}
                  isSubscribing={isSubscribing}
                  testID={testID}
                  style={{ marginTop: 5 }}
                />
                {isSubscribed && (
                  <SettingsButton handleToggleSettings={handleToggleSettings} showCheckmark={showSettings} />
                )}
              </View>
            </View>
          </View>
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
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    minHeight: PV.Table.cells.podcast.wrapper.height,
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: PV.Colors.Velvet
  },
  autoDownloadText: {
    fontSize: PV.Fonts.sizes.xs,
    color: PV.Colors.grayLight,
    flex: 1,
    alignSelf: 'center'
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
    backgroundColor: 'transparent'
  },
  contentWrapperBottomRow: {
    backgroundColor: 'transparent',
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  contentWrapperTop: {
    marginBottom: 15,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between'
  },
  title: {
    flexWrap: 'wrap',
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold,
    maxWidth: 250
  }
})
