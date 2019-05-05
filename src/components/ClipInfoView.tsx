import { StyleSheet, View } from 'react-native'
import React from 'reactn'
import { readableClipTime, readableDate } from '../lib/utility'
import { PV } from '../resources'
import { core } from '../styles'
import { ActivityIndicator, Divider, ScrollView, TableSectionHeader, Text, TextLink } from './'

type Props = {
  createdAt: string
  endTime?: number
  handleClosePress: any
  isLoading?: boolean
  navigation: any
  ownerId?: string
  ownerIsPublic?: boolean
  ownerName?: string
  startTime: number
  title?: string
}

type State = {}

export class ClipInfoView extends React.PureComponent<Props, State> {

  _navToProfileScreen = () => {
    const { navigation, ownerId, ownerName } = this.props
    const user = {
      id: ownerId,
      name: ownerName
    }

    navigation.navigate(
      PV.RouteNames.ProfileScreen, {
        user,
        navigationTitle: 'Profile'
      }
    )
  }

  render() {
    const { createdAt, endTime, handleClosePress, isLoading, ownerIsPublic, ownerName = 'anonymous',
      startTime, title } = this.props
    const { globalTheme } = this.global

    return (
      <View style={[styles.wrapper, globalTheme.view]}>
        {
          isLoading && <ActivityIndicator />
        }
        {
          !isLoading &&
          <View style={styles.wrapper}>
              <TableSectionHeader
                handleClosePress={handleClosePress}
                title='Clip Info' />
              <ScrollView style={styles.scrollView}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.time}>{readableClipTime(startTime, endTime)}</Text>
                <Divider style={styles.divider} />
                <Text style={styles.text}>Created: {readableDate(createdAt)}</Text>
                <View style={core.row}>
                  <Text style={styles.inlineText}>By: </Text>
                  {
                    ownerIsPublic ?
                      <TextLink
                        onPress={this._navToProfileScreen}
                        style={styles.link}>
                        {ownerName}
                      </TextLink> :
                      <Text style={styles.inlineText}>{ownerName}</Text>
                  }
                </View>
              </ScrollView>
            </View>
        }
      </View>
    )
  }
}

const styles = StyleSheet.create({
  divider: {
    marginBottom: 8
  },
  inlineText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    marginBottom: 8
  },
  link: {
    flex: 0,
    fontSize: PV.Fonts.sizes.lg
  },
  scrollView: {
    flex: 1,
    padding: 8
  },
  text: {
    fontSize: PV.Fonts.sizes.md,
    marginBottom: 8
  },
  time: {
    fontSize: PV.Fonts.sizes.lg,
    marginBottom: 8
  },
  title: {
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 8
  },
  wrapper: {
    flex: 1
  }
})
