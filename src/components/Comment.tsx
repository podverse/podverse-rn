import { PVComment } from 'podverse-shared'
import React from 'react'
import { Alert, Linking } from 'react-native'
import { useGlobal } from 'reactn'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { FastImage, PressableWithOpacity, Text, View } from '.'

type Props = {
  children?: React.ReactNode[]
  comment: PVComment
}

export const Comment = ({ children, comment }: Props) => {
  const [globalTheme] = useGlobal('globalTheme')
  const { content, imageUrl, isRoot, profileIcon, published, url, username } = comment
  const withTime = true

  const handleFollowLink = (url: string | null) => {
    if (url) {
      Alert.alert(PV.Alerts.LEAVING_APP.title, PV.Alerts.LEAVING_APP.message, [
        { text: 'Cancel' },
        { text: 'Yes', onPress: () => Linking.openURL(url) }
      ])
    }
  }

  return (
    <View style={[styles.wrapper, globalTheme.flatList]}>
      <View style={styles.innerWrapper}>
        <PressableWithOpacity onPress={() => handleFollowLink(url)}>
          <View style={styles.innerTopWrapper}>
            {profileIcon ? <FastImage styles={styles.profileIcon} source={profileIcon} isSmall /> : null}
            <Text style={styles.username}>{username}</Text>
          </View>
          <View style={styles.innerLinkWrapper}>
            <Text style={styles.content}>{content}</Text>
            <Text style={styles.published}>{readableDate(published, withTime)}</Text>
            {isRoot && imageUrl && <FastImage styles={styles.rootImage} source={imageUrl} />}
          </View>
        </PressableWithOpacity>
      </View>
      {children && children.length > 0 ? <View style={styles.indentWrapper}>{children}</View> : null}
    </View>
  )
}

const styles = {
  content: {
    flexWrap: 'wrap',
    fontSize: PV.Fonts.sizes.xl
  },
  indentWrapper: {
    marginLeft: 10
  },
  innerLinkWrapper: {},
  innerTopWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 9
  },
  innerWrapper: {
    marginBottom: 20
  },
  profileIcon: {
    height: 36,
    marginRight: 10,
    width: 36
  },
  published: {
    color: PV.Colors.grayLighter,
    fontSize: PV.Fonts.sizes.md,
    marginTop: 6
  },
  username: {
    color: PV.Colors.skyLight,
    flex: 1,
    flexWrap: 'wrap',
    fontSize: PV.Fonts.sizes.xl
  },
  wrapper: {}
}
