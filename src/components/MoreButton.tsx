import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useGlobal } from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { ActivityIndicator } from '.'

type Props = {
  handleMorePress: any
  isLoading?: boolean
  itemType: 'episode' | 'clip' | 'chapter'
  testID: string
}

export const MoreButton = (props: Props) => {
  const { handleMorePress, isLoading, itemType, testID } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <TouchableOpacity
      accessibilityHint={`${translate('ARIA HINT - show more options for this')} ${translate(itemType)}`}
      accessibilityLabel={translate('More')}
      accessibilityRole='button'
      hitSlop={{
        bottom: 10,
        left: 10,
        right: 10,
        top: 10
      }}
      onPress={handleMorePress}
      testID={`${testID}_more_button`.prependTestId()}>
      {!isLoading ? (
        <View style={[styles.imageWrapper]}>
          <Image resizeMode='contain' source={PV.Images.MORE} style={[styles.image, globalTheme.buttonImage]} />
        </View>
      ) : (
        <View style={[styles.activityWrapper]}>
          <ActivityIndicator onPress={handleMorePress} styles={[styles.activityIndicator]} testID={testID} />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 0,
    height: 44,
    width: 44,
    lineHeight: 44,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0
  },
  activityWrapper: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    width: 44
  },
  image: {
    height: 30,
    width: 30,
    tintColor: 'white'
  },
  imageWrapper: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44
  }
})
