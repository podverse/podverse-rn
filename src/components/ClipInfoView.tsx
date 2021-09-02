import { StyleSheet, View } from 'react-native'
import React, { Fragment } from 'reactn'
import { translate } from '../lib/i18n'
import { readableClipTime, safelyUnwrapNestedVariable } from '../lib/utility'
import { PV } from '../resources'
import { PVTrackPlayer, restartNowPlayingItemClip } from '../services/player'
import { button, core } from '../styles'
import { ActivityIndicator, Divider, Icon, TableSectionSelectors, Text, TextLink } from './'

type Props = {
  createdAt: string
  endTime?: number
  isLoading?: boolean
  isOfficialChapter?: boolean
  isOfficialSoundBite?: boolean
  isPublic?: boolean
  navigation: any
  ownerId?: string
  ownerIsPublic?: boolean
  ownerName?: string
  startTime: number
  title?: string
}

const testIDPrefix = 'clip_info_view'

export class ClipInfoView extends React.PureComponent<Props> {
  _navToProfileScreen = () => {
    const { navigation, ownerId, ownerName } = this.props
    const user = {
      id: ownerId,
      name: ownerName
    }

    navigation.navigate(PV.RouteNames.ProfileScreen, {
      user,
      navigationTitle: translate('Profile')
    })
  }

  _handleEditPress = async () => {
    const { isPublic, navigation } = this.props
    const initialProgressValue = await PVTrackPlayer.getTrackPosition()
    const isLoggedIn = safelyUnwrapNestedVariable(() => this.global.session.isLoggedIn, false)
    const globalTheme = safelyUnwrapNestedVariable(() => this.global.globalTheme, {})

    navigation.navigate(PV.RouteNames.MakeClipScreen, {
      initialProgressValue,
      initialPrivacy: isPublic,
      isEditing: true,
      isLoggedIn,
      globalTheme
    })
  }

  render() {
    const {
      endTime,
      isLoading,
      isOfficialChapter,
      isOfficialSoundBite,
      ownerIsPublic,
      ownerId,
      ownerName = translate('anonymous'),
      startTime
    } = this.props
    const { session } = this.global
    const userId = session?.userInfo?.id

    let { title } = this.props
    if (!title) {
      title = isOfficialChapter ? translate('Untitled Chapter') : translate('Untitled Clip')
    }
    const sectionHeaderTitle = isOfficialChapter ? translate('Chapter Info') : translate('Clip Info')

    return (
      <View accessible={false} style={styles.wrapper}>
        {isLoading && <ActivityIndicator testID={testIDPrefix} />}
        {!isLoading && (
          <Fragment>
            <TableSectionSelectors
              accessible={false}
              disableFilter
              selectedFilterLabel={sectionHeaderTitle} />
            <View style={core.row}>
              <View
                accessible={false}
                style={styles.topTextWrapper}>
                <Text
                  accessible={false}
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  style={styles.title}>
                  {title}
                </Text>
                <Text
                  accessible={false}
                  fontSizeLargestScale={PV.Fonts.largeSizes.sm}
                  style={styles.time}>
                  {readableClipTime(startTime, endTime)}
                </Text>
              </View>
              {userId && userId === ownerId && (
                <View accessible={false} style={styles.topEditButtonWrapper}>
                  <Icon
                    accessible={false}
                    name='pencil-alt'
                    onPress={() => this._handleEditPress()}
                    size={26}
                    style={button.iconOnlySmall}
                  />
                </View>
              )}
            </View>
            {!isOfficialChapter && !isOfficialSoundBite && (
              <View style={core.row}>
                <Text
                  accessible={false}
                  fontSizeLargestScale={PV.Fonts.largeSizes.md}
                  style={styles.ownerName}>
                  {`${translate('By')} `}
                </Text>
                {ownerIsPublic ? (
                  <TextLink
                    accessible={false}
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    onPress={this._navToProfileScreen}
                    style={styles.ownerName}
                    text={ownerName || translate('anonymous')} />
                ) : (
                  <Text
                    accessible={false}
                    fontSizeLargestScale={PV.Fonts.largeSizes.md}
                    style={styles.ownerName}>
                    {translate('anonymous')}
                  </Text>
                )}
              </View>
            )}
            {!isOfficialChapter && (
              <TextLink
                accessible={false}
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                onPress={restartNowPlayingItemClip}
                style={styles.replayClip}
                text={translate('Replay Clip')} />
            )}
            <Divider style={styles.divider} />
          </Fragment>
        )}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  divider: {
    marginTop: 16
  },
  ownerName: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    marginTop: 12
  },
  replayClip: {
    flex: 0,
    fontSize: PV.Fonts.sizes.md,
    marginTop: 8,
    paddingVertical: 8
  },
  scrollView: {
    flex: 1
  },
  text: {
    fontSize: PV.Fonts.sizes.md
  },
  time: {
    color: PV.Colors.skyLight,
    fontSize: PV.Fonts.sizes.md,
    marginTop: 8
  },
  title: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  topEditButtonWrapper: {
    flex: 0,
    marginLeft: 4,
    marginTop: 12
  },
  topTextWrapper: {
    flex: 1,
    marginVertical: 8
  },
  wrapper: {
    flex: 1,
    paddingHorizontal: 8
  }
})
