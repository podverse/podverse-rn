import React from 'react'
import { Image, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native'
import { useGlobal } from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { button } from '../styles'
import { Icon, Text, View } from './'

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

  const moreButton = (
    <View style={styles.buttonView}>
      <Icon
        name='ellipsis-h'
        onPress={handleMorePress}
        size={26}
        style={button.iconOnly} />
    </View>
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
          handleMorePress && moreButton
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
    fontSize: PV.Fonts.sizes.md
  },
  image: {
    flex: 0,
    height: 60,
    marginRight: 12,
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
    flex: 1
  },
  title: {
    fontSize: PV.Fonts.sizes.md,
    fontWeight: PV.Fonts.weights.semibold,
    marginTop: 2
  },
  wrapper: {
    margin: 8
  },
  wrapperTop: {
    flexDirection: 'row',
    marginBottom: 8
  }
})
