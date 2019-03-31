import React from 'react'
import { Image, StyleSheet, TouchableOpacity } from 'react-native'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  handleMorePress?: any
  podcastImageUrl?: string
  pubDate?: string
  title: string
}

export const EpisodeTableHeader = (props: Props) => {
  const { handleMorePress, podcastImageUrl, pubDate, title } = props

  return (
    <View style={styles.wrapper}>
      <Image
        source={{ uri: podcastImageUrl }}
        style={styles.image} />
      <View style={styles.textWrapper}>
        <Text
          numberOfLines={3}
          style={styles.title}>{title}</Text>
        <Text
          isSecondary={true}
          style={styles.pubDate}>
          {readableDate(pubDate)}
        </Text>
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
  )
}

const styles = StyleSheet.create({
  buttonView: {
    flex: 0,
    marginLeft: 8,
    marginRight: 8
  },
  image: {
    flex: 0,
    height: 88,
    marginRight: 12,
    width: 88
  },
  moreButton: {
    flex: 0,
    marginBottom: 'auto',
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
  pubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 2
  },
  textWrapper: {
    flex: 1,
    paddingBottom: 5,
    paddingRight: 8,
    paddingTop: 6
  },
  title: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    flexDirection: 'row'
  }
})
