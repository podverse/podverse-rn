import React from 'react'
import { Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { useGlobal } from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { button } from '../styles'
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
  const [globalTheme] = useGlobal('globalTheme')

  const innerTopView = (
    <View style={styles.innerTopView}>
      {
        !!podcastImageUrl &&
        <Image
          source={{ uri: podcastImageUrl }}
          style={styles.image} />
      }
      <View style={styles.textWrapper}>
        {
          !!podcastTitle &&
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
          !!pubDate &&
          <Text
            isSecondary={true}
            style={styles.bottomText}>
            {readableDate(pubDate)}
          </Text>
        }
      </View>
    </View>
  )

  const bottomText = (
    <Text
      numberOfLines={4}
      style={styles.description}>
      {description}
    </Text>
  )

  return (
    <View style={styles.wrapper}>
      <View style={styles.wrapperTop}>
        {
          handleNavigationPress ?
            <TouchableWithoutFeedback onPress={handleNavigationPress}>
              {innerTopView}
            </TouchableWithoutFeedback> :
            innerTopView
        }
        {
          handleMorePress &&
            <TouchableOpacity
              onPress={handleMorePress}
              style={moreButtonAlignToTop ? button.iconOnlyAlignToTop : button.iconOnly}>
              <Image
                source={PV.Images.MORE}
                style={[button.iconOnlyImage, globalTheme.buttonImage]}
                resizeMode='contain' />
            </TouchableOpacity>
        }
      </View>
      {
        !!description && handleNavigationPress &&
          <TouchableWithoutFeedback onPress={handleNavigationPress}>
            {bottomText}
          </TouchableWithoutFeedback>
      }
      {
        !!description && !handleNavigationPress && bottomText
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
  innerTopView: {
    flex: 1,
    flexDirection: 'row'
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
    paddingBottom: 12,
    paddingTop: 12
  },
  wrapperTop: {
    flex: 1,
    flexDirection: 'row'
  }
})
