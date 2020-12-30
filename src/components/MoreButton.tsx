import React from 'react'
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useGlobal } from 'reactn'
import { ActivityIndicator } from '.'
import { testProps } from '../lib/utility'
import { PV } from '../resources'

type Props = {
  handleShowMore: any
  isLoading?: boolean
  testID: string
}

export const MoreButton = (props: Props) => {
  const { handleShowMore, isLoading, testID } = props
  const [globalTheme] = useGlobal('globalTheme')

  return (
    <TouchableOpacity
      hitSlop={{
        bottom: 10,
        left: 10,
        right: 10,
        top: 10
      }}
      onPress={handleShowMore}
      {...testProps(`${testID}_more_button`)}>
      {!isLoading ? (
        <View style={[styles.outerWrapper]}>
          <View style={styles.innerWrapper}>
            <Image resizeMode='contain' source={PV.Images.MORE} style={[styles.image, globalTheme.buttonImage]} />
          </View>
        </View>
      ) : (
        <View style={[styles.activityWrapper]}>
          <ActivityIndicator onPress={handleShowMore} styles={[styles.activityIndicator]} />
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    flex: 0,
    height: 50,
    width: 44,
    lineHeight: 50,
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
  innerWrapper: {
    height: 44,
    width: 44,
    tintColor: 'white',
    alignItems: 'center',
    justifyContent: 'center'
  },
  outerWrapper: {
    alignItems: 'center',
    height: 50,
    justifyContent: 'center',
    width: 44
  }
})
