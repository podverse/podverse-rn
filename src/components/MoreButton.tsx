import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useGlobal } from 'reactn'
import { ActivityIndicator } from '.'
import { testProps } from '../lib/utility'
import { PV } from '../resources'

type Props = {
  handleShowMore: any
  height: number
  isLoading?: boolean
  testID?: string
}

export const MoreButton = (props: Props) => {
  const { handleShowMore, height, isLoading, testID } = props
  const [globalTheme] = useGlobal('globalTheme')

  const heightStyle = { height }

  return (
    <TouchableOpacity
      hitSlop={{
        bottom: 4,
        left: 8,
        right: 8,
        top: 4
      }}
      onPress={handleShowMore}
      {...(testID ? testProps(testID) : {})}>
      {!isLoading ? (
        <View style={[styles.outerWrapper, heightStyle]}>
          <View style={styles.innerWrapper}>
            <Image resizeMode='contain' source={PV.Images.MORE} style={[styles.image, globalTheme.buttonImage]} />
          </View>
        </View>
      ) : (
        <View style={[styles.activityWrapper, heightStyle]}>
          <ActivityIndicator onPress={handleShowMore} styles={[styles.activityIndicator, heightStyle]} />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 0,
    height: 64,
    lineHeight: 64,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
    width: 44
  },
  activityWrapper: {
    alignItems: 'center',
    flex: 0,
    justifyContent: 'center',
    width: 44
  },
  image: {
    height: 36,
    marginLeft: 3,
    marginTop: 3,
    tintColor: 'white',
    width: 36
  },
  innerWrapper: {
    borderColor: PV.Colors.gray,
    borderRadius: 44,
    borderWidth: 1,
    height: 44,
    tintColor: 'white',
    width: 44
  },
  outerWrapper: {
    alignItems: 'center',
    height: 64,
    justifyContent: 'center',
    width: 44
  }
})
