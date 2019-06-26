import { Image, StyleSheet, Switch } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { core } from '../styles'
import { ActivityIndicator, Icon, SubscribeButton, Text, View } from './'

type Props = {
  autoDownloadOn?: boolean
  handleToggleAutoDownload?: any
  handleToggleSubscribe: any
  isLoading?: boolean
  isNotFound?: boolean
  isSubscribed?: boolean
  isSubscribing?: boolean
  podcastImageUrl?: string
  podcastTitle: string
}

export const PodcastTableHeader = (props: Props) => {
  const { autoDownloadOn, handleToggleAutoDownload, handleToggleSubscribe, isLoading, isNotFound, isSubscribed,
    isSubscribing, podcastImageUrl, podcastTitle = 'untitled podcast' } = props

  return (
    <View style={core.row}>
      {
        isLoading &&
          <View style={[styles.wrapper, core.view]}>
            <ActivityIndicator />
          </View>
      }
      {
        !isLoading && !isNotFound &&
          <View style={styles.wrapper}>
            <Image
              source={{ uri: podcastImageUrl }}
              style={styles.image} />
            <View style={styles.textWrapper}>
              <View style={styles.textWrapperTop}>
                <Text
                  numberOfLines={2}
                  style={styles.title}>{podcastTitle}</Text>
                <SubscribeButton
                  handleToggleSubscribe={handleToggleSubscribe}
                  isSubscribed={isSubscribed}
                  isSubscribing={isSubscribing} />
              </View>
              <View style={styles.textWrapperBottom}>
                <Text
                  isSecondary={true}
                  style={styles.autoDownloadText}>
                  Auto
                </Text>
                <Icon
                  isSecondary={true}
                  name='download'
                  size={13}
                  style={styles.autoDownloadIcon} />
                <Switch
                  onValueChange={handleToggleAutoDownload}
                  value={autoDownloadOn} />
              </View>
            </View>
          </View>
      }
      {
        !isLoading && isNotFound &&
          <View style={[styles.wrapper, core.view]}>
            <Text style={styles.notFoundText}>Podcast Not Found</Text>
          </View>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  autoDownloadIcon: {
    marginRight: 8
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
    height: 92,
    marginRight: 12,
    width: 92
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  textWrapper: {
    flex: 1,
    paddingBottom: 4,
    paddingRight: 8,
    paddingTop: 6
  },
  textWrapperBottom: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  textWrapperTop: {
    alignItems: 'flex-start',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  title: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    height: 92
  }
})
