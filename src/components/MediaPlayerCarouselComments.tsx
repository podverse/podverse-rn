import { PVComment, SocialInteraction, SocialInteractionKeys } from 'podverse-shared'
import { StyleSheet } from 'react-native'
import React from 'reactn'
import { errorLogger } from '../lib/logger'
import { translate } from '../lib/i18n'
import { getEpisodeProxyActivityPub, getEpisodeProxyTwitter } from '../services/comment'
import { PV } from '../resources'
import { ActivityIndicator, Comment, ScrollView, TableSectionSelectors, Text, View } from './'

type Props = {
  navigation?: any
  width: number
}

type State = {
  commentNodes: any
  isLoading?: boolean
}

const testIDPrefix = 'media_player_carousel_comments'
const _fileName = 'src/components/MediaPlayerCarouselComments.tsx'

export class MediaPlayerCarouselComments extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props)
    this.state = {
      commentNodes: null,
      isLoading: true
    }
  }

  componentDidMount() {
    const { player } = this.global
    const { episode } = player

    if (episode?.socialInteraction?.length) {
      const activityPub = episode.socialInteraction.find(
        (item: SocialInteraction) =>
          item.protocol === SocialInteractionKeys.protocol.activitypub ||
          item.platform === SocialInteractionKeys.platform.activitypub ||
          item.platform === SocialInteractionKeys.platform.castopod ||
          item.platform === SocialInteractionKeys.platform.mastodon ||
          item.platform === SocialInteractionKeys.platform.peertube
      )

      const twitter = episode.socialInteraction.find(
        (item: SocialInteraction) =>
          item.protocol === SocialInteractionKeys.protocol.twitter ||
          item.platform === SocialInteractionKeys.platform.twitter
      )

      if (activityPub?.uri || activityPub?.url) {
        this.setState({ isLoading: true }, () => {
          (async () => {
            try {
              const comment = await getEpisodeProxyActivityPub(episode.id)
              const commentNodes = generateCommentNodes(comment)
              this.setState({
                commentNodes,
                isLoading: false
              })
            } catch (error) {
              errorLogger(_fileName, 'componentDidMount', error)
              this.setState({ isLoading: false })
            }
          })()
        })
      } else if (twitter?.uri || twitter?.url) {
        this.setState({ isLoading: true }, () => {
          (async () => {
            try {
              const comment = await getEpisodeProxyTwitter(episode.id)
              const commentNodes = generateCommentNodes(comment)
              this.setState({
                commentNodes,
                isLoading: false
              })
            } catch (error) {
              errorLogger(_fileName, 'componentDidMount', error)
              this.setState({ isLoading: false })
            }
          })()
        })
      }
    }
  }

  render() {
    const { width } = this.props
    const { commentNodes, isLoading } = this.state

    return (
      <ScrollView
        contentContainerStyle={styles.wrapperContainer}
        style={[styles.wrapper, { width }]}
        testID={`${testIDPrefix}_comments_view`}
        transparent>
        <TableSectionSelectors disableFilter includePadding selectedFilterLabel={translate('Comments')} />
        {isLoading && (
          <ActivityIndicator
            accessibilityLabel={translate('Comments are loading')}
            fillSpace
            testID={`${testIDPrefix}_comments_are_loading`}
          />
        )}
        {!isLoading && commentNodes}
        {!isLoading && !commentNodes && (
          <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
            <Text style={styles.noResultsFound} testID={`${testIDPrefix}_no_results_found`}>
              {translate('No comments found')}
            </Text>
          </View>
        )}
      </ScrollView>
    )
  }
}

const generateCommentNodes = (comment: PVComment) => {
  if (!comment) return null
  const replyNodes = []

  const { replies } = comment
  for (const reply of replies) {
    replyNodes.push(generateCommentNodes(reply))
  }

  return (
    <Comment comment={comment} key={comment.url}>
      {replyNodes}
    </Comment>
  )
}

const styles = StyleSheet.create({
  commentsWrapper: {
    flex: 1,
    marginHorizontal: 8
  },
  headerText: {},
  noResultsFound: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 32,
    marginHorizontal: 16,
    marginTop: -8,
    textAlign: 'center'
  },
  wrapper: {
    flex: 1
  },
  wrapperContainer: {
    flexGrow: 1,
    paddingHorizontal: 8
  }
})
