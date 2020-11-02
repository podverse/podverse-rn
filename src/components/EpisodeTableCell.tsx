import { StyleSheet, TouchableWithoutFeedback, View as RNView } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { decodeHTMLString, readableDate, removeHTMLFromString, testProps } from '../lib/utility'
import { PV } from '../resources'
import { FastImage, IndicatorDownload, MoreButton, Text, View } from './'

type Props = {
  description?: string
  handleMorePress?: any
  handleNavigationPress?: any
  hasZebraStripe?: boolean
  hideImage?: boolean
  id: string
  podcastImageUrl?: string
  podcastTitle?: string
  pubDate?: string
  testID: string
  title?: string
  transparent?: boolean
}

export class EpisodeTableCell extends React.PureComponent<Props> {
  render() {
    const {
      id,
      pubDate = '',
      handleMorePress,
      handleNavigationPress,
      hasZebraStripe,
      hideImage,
      podcastImageUrl,
      podcastTitle,
      testID,
      transparent
    } = this.props
    let { description = '', title } = this.props
    description = removeHTMLFromString(description)
    description = decodeHTMLString(description)

    const { downloadedEpisodeIds, downloadsActive, fontScaleMode } = this.global

    const isDownloading = downloadsActive[id]
    const isDownloaded = downloadedEpisodeIds[id]

    if (!title) title = translate('untitled episode')

    const titleStyle = (podcastTitle ? styles.title : [styles.title, { marginTop: 0 }]) as any

    const innerTopView = (
      <RNView style={styles.innerTopView}>
        {!!podcastImageUrl && <FastImage isSmall={true} source={podcastImageUrl} styles={styles.image} />}
        <RNView style={styles.textWrapper}>
          {!!podcastTitle && (
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary={true}
              numberOfLines={1}
              style={styles.podcastTitle}
              testID={`${testID}_podcast_title`}>
              {podcastTitle}
            </Text>
          )}
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={4}
            style={titleStyle}
            testID={`${testID}_title`}>
            {title}
          </Text>
          <RNView style={styles.textWrapperBottomRow}>
            <Text
              fontSizeLargestScale={PV.Fonts.largeSizes.sm}
              isSecondary={true}
              style={styles.pubDate}
              testID={`${testID}_pub_date`}>
              {readableDate(pubDate)}
            </Text>
            {isDownloaded && <IndicatorDownload />}
          </RNView>
        </RNView>
      </RNView>
    )

    const descriptionStyle = hideImage ? [styles.description, { paddingLeft: 0 }] : styles.description

    const bottomText = (
      <Text
        fontSizeLargestScale={PV.Fonts.largeSizes.md}
        isSecondary={true}
        numberOfLines={4}
        style={descriptionStyle}
        testID={`${testID}_description`}>
        {description}
      </Text>
    )

    return (
      <View hasZebraStripe={hasZebraStripe} style={styles.wrapper} transparent={transparent}>
        <RNView style={styles.wrapperTop}>
          {handleNavigationPress ? (
            <TouchableWithoutFeedback
              onPress={handleNavigationPress}
              {...(testID ? testProps(`${testID}_top_view_nav`) : {})}>
              {innerTopView}
            </TouchableWithoutFeedback>
          ) : (
            innerTopView
          )}
          {handleMorePress && PV.Fonts.fontScale.largest !== fontScaleMode && (
            <MoreButton
              handleShowMore={handleMorePress}
              height={hideImage ? 46 : 64}
              isLoading={isDownloading}
              testID={testID}
            />
          )}
        </RNView>
        {!!description && handleNavigationPress && (
          <TouchableWithoutFeedback
            onPress={handleNavigationPress}
            {...(testID ? testProps(`${testID}_bottom_view_nav`) : {})}>
            <RNView>{PV.Fonts.fontScale.largest !== fontScaleMode && bottomText}</RNView>
          </TouchableWithoutFeedback>
        )}
        {!!description && !handleNavigationPress && bottomText}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  description: {
    fontSize: PV.Fonts.sizes.md,
    marginTop: 8,
    paddingLeft: 76
  },
  image: {
    flex: 0,
    height: 64,
    marginRight: 12,
    width: 64
  },
  innerTopView: {
    flex: 1,
    flexDirection: 'row',
    marginRight: 4
  },
  podcastTitle: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    justifyContent: 'flex-start'
  },
  pubDate: {
    flex: 0,
    fontSize: PV.Fonts.sizes.sm,
    marginTop: 3
  },
  textWrapper: {
    flex: 1
  },
  textWrapperBottomRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  title: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    paddingBottom: 14,
    paddingHorizontal: 8,
    paddingTop: 16
  },
  wrapperTop: {
    flexDirection: 'row'
  }
})
