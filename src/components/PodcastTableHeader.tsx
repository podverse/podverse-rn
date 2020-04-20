import { StyleSheet, Switch } from 'react-native'
import React, { useGlobal } from 'reactn'
import { PV } from '../resources'
import { core } from '../styles'
import { ActivityIndicator, FastImage, IndicatorDownload, SettingsButton, SubscribeButton, Text, View } from './'

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
    podcastTitle = 'untitled podcast',
    showSettings
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
          <View style={styles.textWrapper}>
            <View style={styles.textWrapperTop}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={titleNumberOfLines}
                style={styles.title}>
                {podcastTitle}
              </Text>
              <SubscribeButton
                handleToggleSubscribe={handleToggleSubscribe}
                isSubscribed={isSubscribed}
                isSubscribing={isSubscribing}
              />
            </View>
            <View style={styles.textWrapperBottom}>
              <View style={styles.textWrapperBottomLeft}>
                {isSubscribed && !showSettings && <SettingsButton handleToggleSettings={handleToggleSettings} />}
                {isSubscribed && showSettings && (
                  <SettingsButton handleToggleSettings={handleToggleSettings} showCheckmark={true} />
                )}
              </View>
              <View style={styles.textWrapperBottomRight}>
                <Text fontSizeLargestScale={PV.Fonts.largeSizes.xs} isSecondary={true} style={styles.autoDownloadText}>
                  Auto
                </Text>
                <IndicatorDownload style={styles.autoDownloadIcon} />
                <Switch onValueChange={handleToggleAutoDownload} value={autoDownloadOn} />
              </View>
            </View>
          </View>
        </View>
      )}
      {!isLoading && isNotFound && (
        <View style={[styles.wrapper, core.view]}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.notFoundText}>
            Podcast Not Found
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  autoDownloadIcon: {
    marginLeft: 0,
    marginRight: 8,
    marginTop: 0
  },
  autoDownloadText: {
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.semibold,
    marginRight: 6,
    marginTop: 2
  },
  buttonView: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    marginLeft: 8
  },
  image: {
    flex: 0,
    height: PV.Table.cells.podcast.image.height,
    marginRight: 12,
    width: PV.Table.cells.podcast.image.width
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  textWrapper: {
    flex: 1,
    paddingBottom: 4,
    paddingRight: 8,
    paddingTop: 2
  },
  textWrapperBottom: {
    alignItems: 'flex-end',
    flex: 0,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  textWrapperBottomLeft: {
    flexDirection: 'row'
  },
  textWrapperBottomRight: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  textWrapperTop: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  title: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    minHeight: PV.Table.cells.podcast.wrapper.height
  }
})
