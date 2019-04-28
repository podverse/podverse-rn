import { Image, StyleSheet, Switch } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { Icon, Text, View } from './'

type Props = {
  autoDownloadOn?: boolean
  handleToggleAutoDownload?: any
  handleToggleSubscribe: any
  isSubscribed?: boolean
  podcastImageUrl?: string
  podcastTitle: string
}

export const PodcastTableHeader = (props: Props) => {
  const { autoDownloadOn, handleToggleAutoDownload, handleToggleSubscribe, isSubscribed, podcastImageUrl,
    podcastTitle = 'untitled podcast' } = props

  return (
    <View style={styles.wrapper}>
      <Image
        source={{ uri: podcastImageUrl }}
        style={styles.image} />
      <View style={styles.textWrapper}>
        <View style={styles.textWrapperTop}>
          <Text
            numberOfLines={2}
            style={styles.title}>{podcastTitle}</Text>
          {
            handleToggleSubscribe &&
              <View style={styles.buttonView}>
                {
                  isSubscribed ?
                    <Icon
                      name='star'
                      onPress={handleToggleSubscribe}
                      size={32}
                      solid={true} /> :
                    <Icon
                      name='star'
                      onPress={handleToggleSubscribe}
                      size={32} />
                }
              </View>
          }
        </View>
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
    flexDirection: 'row'
  }
})
