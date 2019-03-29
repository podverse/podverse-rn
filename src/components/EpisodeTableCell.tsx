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
          <Text style={styles.episodeTitle}>{episodeTitle}</Text>
          <View style={styles.textWrapperBottom}>
            {
              podcastTitle &&
                <Text
                  isSecondary={true}
                  style={styles.bottomText}>
                  {podcastTitle}
                </Text>
            }
            {
              episodePubDate &&
                <Text
                  isSecondary={true}
                  style={styles.bottomText}>
                  {episodePubDate}
                </Text>
            }
          </View>
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
        episodeSummary ?
          <Text style={styles.episodeSummary}>{episodeSummary}</Text>
          : <Text style={styles.episodeSummary}>{episodeSummary}</Text>
      }
    </View>
  )
}

const styles = StyleSheet.create({
  bottomText: {
    flex: 0,
    justifyContent: 'flex-end',
    marginTop: 2
  },
  episodeSummary: {
    fontSize: PV.Fonts.sizes.sm,
    fontWeight: PV.Fonts.weights.thin,
    marginBottom: 8,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 12
  },
  episodeTitle: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  image: {
    flex: 0,
    height: 92,
    marginRight: 16,
    width: 92
  },
  moreButton: {
    flex: 0,
    marginBottom: 'auto',
    marginTop: 'auto',
    marginRight: 12
  },
  moreButtonImage: {
    borderColor: 'white',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    tintColor: 'white',
    width: 44
  },
  textWrapper: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 7,
    paddingRight: 16,
    paddingTop: 7
  },
  textWrapperBottom: {
    fontSize: PV.Fonts.sizes.md,
    justifyContent: 'flex-end'
  },
  wrapper: {
    flexDirection: 'row'
  }
})
