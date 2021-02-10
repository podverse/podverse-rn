import { StyleSheet, View } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Icon, Text } from './'

type Props = {
  hasAtLeastXCharacters: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasUppercase: boolean
  style: any
}

export class PasswordValidationInfo extends React.PureComponent<Props> {
  render() {
    const { hasAtLeastXCharacters, hasLowercase, hasNumber, hasUppercase, style } = this.props

    return (
      <View style={[styles.wrapper, style]}>
        <View style={styles.textRow}>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} numberOfLines={1} style={styles.label}>
            {translate('Password requirements')}
          </Text>
        </View>
        <View style={styles.textRow}>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={hasUppercase ? styles.validText : styles.invalidText}>
            {translate('has uppercase')}
          </Text>
          {hasUppercase && <Icon name='check' size={18} style={styles.icon} />}
        </View>
        <View style={styles.textRow}>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={hasLowercase ? styles.validText : styles.invalidText}>
            {translate('has lowercase')}
          </Text>
          {hasLowercase && <Icon name='check' size={18} style={styles.icon} />}
        </View>
        <View style={styles.textRow}>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={hasNumber ? styles.validText : styles.invalidText}>
            {translate('has number')}
          </Text>
          {hasNumber && <Icon name='check' size={18} style={styles.icon} />}
        </View>
        <View style={styles.textRow}>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={hasAtLeastXCharacters ? styles.validText : styles.invalidText}>
            {translate('is at least 8 characters')}
          </Text>
          {hasAtLeastXCharacters && <Icon name='check' size={18} style={styles.icon} />}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  icon: {
    color: PV.Colors.greenLighter,
    marginLeft: 8
  },
  invalidText: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.lg
  },
  label: {
    color: PV.Colors.white,
    flex: 0,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold
  },
  textRow: {
    flexDirection: 'row',
    flex: 0
  },
  validText: {
    color: PV.Colors.greenLighter,
    fontSize: PV.Fonts.sizes.lg
  },
  wrapper: {
    flex: 1
  }
})
