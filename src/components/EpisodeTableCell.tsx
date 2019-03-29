import React from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  episodePubDate?: string
  episodeSummary?: string
  episodeTitle?: string
  handleMorePress?: any
  podcastImageUrl?: string
  podcastTitle: string
}

export const EpisodeTableCell = (props: Props) => {
  const { episodePubDate, episodeSummary, episodeTitle = 'untitled episode', handleMorePress,
  podcastImageUrl, podcastTitle } = props

  return (
    <View>
      <View style={styles.wrapper}>
        {
          podcastImageUrl &&
            <Image
              source={{ uri: podcastImageUrl }}
              style={styles.image} />
        }
        <View style={styles.textWrapper}>
          {
            podcastTitle &&
            <Text
              isSecondary={true}
              numberOfLines={1}
              style={styles.podcastTitle}>
              {podcastTitle}
            </Text>
          }
          <Text style={styles.episodeTitle}>{episodeTitle}</Text>
          {
            episodePubDate &&
            <Text
              isSecondary={true}
              style={styles.bottomText}>
              {episodePubDate}
            </Text>
          }
        </View>
        {
          handleMorePress &&
            <View style={styles.buttonView}>
                <TouchableOpacity
                  style={styles.moreButton}>
                  <Image source={PV.Images.MORE} style={styles.moreButtonImage} resizeMode='contain' />
                </TouchableOpacity>
            </View>
        }
      </View>
      {
        episodeSummary &&
          <Text
            numberOfLines={5}
            style={styles.episodeSummary}>
            {episodeSummary}
          </Text>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  bottomText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-end',
    marginTop: 2
  },
  episodeSummary: {
    fontSize: PV.Fonts.sizes.sm,
    marginBottom: 8,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 11
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.bold
  },
  image: {
    flex: 0,
    height: 60,
    marginLeft: 8,
    marginRight: 12,
    width: 60
  },
  moreButton: {
    flex: 0,
    marginBottom: 'auto',
    marginLeft: 8,
    marginRight: 8,
    marginTop: 'auto'
  },
  moreButtonImage: {
    borderColor: 'white',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    tintColor: 'white',
    width: 44
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-start'
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingRight: 16
  },
  wrapper: {
    flexDirection: 'row'
  }
})
