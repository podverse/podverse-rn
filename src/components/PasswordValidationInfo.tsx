import { StyleSheet, View } from 'react-native'
import React from 'reactn'
import { PV } from '../resources'
import { Icon, Text } from './'

type Props = {
  hasAtLeastXCharacters: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasUppercase: boolean
  style: any
}

type State = {}

export class PasswordValidationInfo extends React.PureComponent<Props, State> {
  render() {
    const { hasAtLeastXCharacters, hasLowercase, hasNumber, hasUppercase, style } = this.props

    return (
      <View style={[styles.wrapper, style]}>
        <View style={styles.textRow}>
          <Text
            numberOfLines={1}
            style={styles.label}>Password requirements:
          </Text>
        </View>
        <View style={styles.textRow}>
          <Text
            numberOfLines={1}
            style={hasUppercase ? styles.validText : styles.invalidText}>- has uppercase
          </Text>
          {
            hasUppercase &&
              <Icon
                name='check'
                size={18}
                style={styles.icon}
              />
          }
        </View>
        <View style={styles.textRow}>
          <Text
            numberOfLines={1}
            style={hasLowercase ? styles.validText : styles.invalidText}>- has lowercase
          </Text>
          {
            hasLowercase &&
            <Icon
              name='check'
              size={18}
              style={styles.icon}
            />
          }
        </View>
        <View style={styles.textRow}>
          <Text
            numberOfLines={1}
            style={hasNumber ? styles.validText : styles.invalidText}>- has number
          </Text>
          {
            hasNumber &&
            <Icon
              name='check'
              size={18}
              style={styles.icon}
            />
          }
        </View>
        <View style={styles.textRow}>
          <Text
            numberOfLines={1}
            style={hasAtLeastXCharacters ? styles.validText : styles.invalidText}>- is at least 8 characters
          </Text>
          {
            hasAtLeastXCharacters &&
            <Icon
              name='check'
              size={18}
              style={styles.icon}
            />
          }
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  icon: {
    color: PV.Colors.greenLighter,
    lineHeight: 26,
    marginLeft: 8
  },
  invalidText: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.lg,
    lineHeight: 26
  },
  label: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    lineHeight: 26
  },
  textRow: {
    flexDirection: 'row'
  },
  validText: {
    color: PV.Colors.greenLighter,
    fontSize: PV.Fonts.sizes.lg,
    lineHeight: 26
  },
  wrapper: {
    flex: 0
  }
})
