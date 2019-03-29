import React from 'react'
import { Image, StyleSheet, Switch } from 'react-native'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  autoDownloadOn?: boolean
  handleToggleAutoDownload?: any
  podcastImageUrl?: string
  podcastTitle: string
}

export const PodcastTableHeader = (props: Props) => {
  const { autoDownloadOn, handleToggleAutoDownload, podcastImageUrl, podcastTitle = 'untitled podcast'
    } = props

  return (
    <View style={styles.wrapper}>
      <Image
        source={{ uri: podcastImageUrl }}
        style={styles.image} />
      <View style={styles.textWrapper}>
        <Text
          numberOfLines={2}
          style={styles.title}>{podcastTitle}</Text>
        <View style={styles.textWrapperBottom}>
          <Text
            isSecondary={true}
            style={styles.autoDownload}>
            Auto Download
          </Text>
          <Switch
            onValueChange={handleToggleAutoDownload}
            value={autoDownloadOn} />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  autoDownload: {
    fontSize: PV.Fonts.sizes.sm,
    marginRight: 6
  },
  image: {
    flex: 0,
    height: 92,
    marginRight: 12,
    width: 92
  },
  textWrapper: {
    flex: 1,
    paddingBottom: 5,
    paddingRight: 8,
    paddingTop: 6
  },
  textWrapperBottom: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  title: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    flexDirection: 'row'
  }
})
