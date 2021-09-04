import React from 'react'
import { StyleSheet } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { button, core } from '../styles'
import { ActivityIndicator, Icon, SubscribeButton, Text, View } from './'

type Props = {
  handleEditPress?: any
  handleToggleSubscribe?: any
  id?: string
  isLoading?: boolean
  isLoggedInUserProfile?: boolean | string
  isNotFound?: boolean
  isSubscribed?: boolean
  isSubscribing?: boolean
  name: string
  testID: string
}

export const ProfileTableHeader = (props: Props) => {
  const {
    handleEditPress,
    handleToggleSubscribe,
    id,
    isLoading,
    isLoggedInUserProfile,
    isNotFound,
    isSubscribed,
    isSubscribing,
    name = translate('anonymous'),
    testID
  } = props

  return (
    <View>
      {isLoading && (
        <View style={styles.wrapper}>
          <ActivityIndicator fillSpace testID={testID} />
        </View>
      )}
      {!isLoading && !isNotFound && (
        <View style={styles.wrapper}>
          <View
            accessible
            accessibilityHint={isLoggedInUserProfile
              ? translate('ARIA HINT - This is your profile name')
              : translate('ARIA HINT - This is the profile name')
            }
            accessibilityLabel={name}
            style={styles.textWrapper}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <Text
                fontSizeLargestScale={PV.Fonts.largeSizes.md}
                numberOfLines={1}
                style={styles.name}>
                {name}
              </Text>
            </View>
          </View>
          {!!handleEditPress && (
            <Icon
              accessibilityHint={translate('ARIA HINT - go to the edit my profile screen')}
              accessibilityLabel={translate('Edit My Profile')}
              name='pencil-alt'
              onPress={() => handleEditPress(id)}
              size={26}
              style={button.iconOnlyMedium} />
          )}
          {!!handleToggleSubscribe && (
            <SubscribeButton
              handleToggleSubscribe={handleToggleSubscribe}
              isProfile
              isSubscribed={isSubscribed}
              isSubscribing={isSubscribing}
              testID={testID}
            />
          )}
        </View>
      )}
      {!isLoading && isNotFound && (
        <View style={[styles.wrapper, core.view]}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.notFoundText}>
            {translate('Profile not found')}
          </Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  buttonView: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    marginLeft: 8,
    marginRight: 8
  },
  name: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold
  },
  notFoundText: {
    fontSize: PV.Fonts.sizes.xxl,
    fontWeight: PV.Fonts.weights.bold
  },
  textWrapper: {
    flexDirection: 'column',
    justifyContent: 'center',
    flex: 1,
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: 64,
    marginHorizontal: 8
  }
})
