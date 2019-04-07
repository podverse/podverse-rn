import React from 'react'
import { Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  description?: string
  handleMorePress?: any
  handleNavigationPress?: any
  moreButtonAlignToTop?: boolean
  podcastImageUrl?: string
  podcastTitle?: string
  pubDate?: string
  title?: string
}

export const EpisodeTableCell = (props: Props) => {
  const { pubDate, description, title = 'untitled episode', handleMorePress,
  handleNavigationPress, moreButtonAlignToTop, podcastImageUrl, podcastTitle } = props

  const moreButtonStyles = [styles.moreButton]
  if (moreButtonAlignToTop) moreButtonStyles.push(styles.moreButtonAlignToTop)

  return (
    <View style={styles.wrapper}>
      <View style={styles.wrapperTop}>
        <TouchableWithoutFeedback
          onPress={handleNavigationPress}>
          <View style={styles.innerTouchableView}>
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
              <Text
                numberOfLines={2}
                style={styles.title}>
                {title}
              </Text>
              {
                pubDate &&
                  <Text
                    isSecondary={true}
                    style={styles.bottomText}>
                    {readableDate(pubDate)}
                  </Text>
              }
            </View>
          </View>
        </TouchableWithoutFeedback>
        {
          handleMorePress &&
            <TouchableOpacity
              style={moreButtonStyles}>
              <Image source={PV.Images.MORE} style={styles.moreButtonImage} resizeMode='contain' />
            </TouchableOpacity>
        }
      </View>
      {
        description &&
        <TouchableWithoutFeedback
          onPress={handleNavigationPress}>
          <Text
            numberOfLines={4}
            style={styles.description}>
            {description}
          </Text>
        </TouchableWithoutFeedback>
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
  description: {
    fontSize: PV.Fonts.sizes.md,
    marginLeft: 8,
    marginRight: 8,
    marginTop: 11
  },
  image: {
    flex: 0,
    height: 60,
    marginLeft: 8,
    width: 60
  },
  innerTouchableView: {
    flex: 1,
    flexDirection: 'row'
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
  moreButtonAlignToTop: {
    marginTop: 5
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    justifyContent: 'flex-start'
  },
  textWrapper: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8
  },
  title: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.semibold
  },
  wrapper: {
    marginBottom: 12,
    marginTop: 12
  },
  wrapperTop: {
    flex: 1,
    flexDirection: 'row'
  }
})
