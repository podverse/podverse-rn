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
  passwordsMatch: boolean
  style: any
}

export class PasswordValidationInfo extends React.PureComponent<Props> {
  render() {
    const { hasAtLeastXCharacters, hasLowercase, hasNumber, hasUppercase, passwordsMatch,
      style } = this.props

    return (
      <View style={[styles.wrapper, style]}>
        <View style={styles.textRow}>
          <Text
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={styles.label}>
            {translate('Password requirements')}
          </Text>
        </View>
        <View
          accessible
          accessibilityHint={passwordsMatch
              ? `${translate('requirement met')}`
              : `${translate('requirement not met')}`}
          style={styles.textRow}>
          <Text
            accessible
            accessibilityHint={hasUppercase
              ? translate('requirement met')
              : translate('requirement not met')
            }
            accessibilityLabel={translate('has uppercase')}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={hasUppercase ? styles.validText : styles.invalidText}>
            {translate('has uppercase')}
          </Text>
          {hasUppercase && (
            <Icon
              name='check'
              size={18}
              style={styles.icon} />
          )}
        </View>
        <View
          accessible
          accessibilityHint={passwordsMatch
              ? `${translate('requirement met')}`
              : `${translate('requirement not met')}`}
          style={styles.textRow}>
          <Text
            accessible
            accessibilityHint={hasLowercase ? translate('requirement met') : translate('requirement not met')}
            accessibilityLabel={translate('has lowercase')}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={hasLowercase ? styles.validText : styles.invalidText}>
            {translate('has lowercase')}
          </Text>
          {hasLowercase && (
            <Icon
              name='check'
              size={18}
              style={styles.icon} />
          )}
        </View>
        <View
          accessible
          accessibilityHint={passwordsMatch
              ? `${translate('requirement met')}`
              : `${translate('requirement not met')}`}
          style={styles.textRow}>
          <Text
            accessible
            accessibilityHint={hasNumber ? translate('requirement met') : translate('requirement not met')}
            accessibilityLabel={translate('has number')}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={hasNumber ? styles.validText : styles.invalidText}>
            {translate('has number')}
          </Text>
            {hasNumber && (
              <Icon
                name='check'
                size={18}
                style={styles.icon} />
            )}
        </View>
        <View
          accessible
          accessibilityHint={passwordsMatch
              ? `${translate('requirement met')}`
              : `${translate('requirement not met')}`}
          style={styles.textRow}>
          <Text
            accessible
            accessibilityHint={hasAtLeastXCharacters ? translate('requirement met') : translate('requirement not met')}
            accessibilityLabel={translate('is at least 8 characters')}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={hasAtLeastXCharacters ? styles.validText : styles.invalidText}>
            {translate('is at least 8 characters')}
          </Text>
          {hasAtLeastXCharacters && (
            <Icon
              name='check'
              size={18}
              style={styles.icon} />
          )}
        </View>
        <View
          accessible
          accessibilityHint={passwordsMatch
              ? `${translate('requirement met')}`
              : `${translate('requirement not met')}`}
          style={styles.textRow}>
          <Text
            accessible
            accessibilityLabel={translate('passwords match')}
            fontSizeLargestScale={PV.Fonts.largeSizes.md}
            numberOfLines={1}
            style={passwordsMatch ? styles.validText : styles.invalidText}>
            {translate('passwords match')}
          </Text>
          {passwordsMatch && (
            <Icon
              accessible
              name='check'
              size={18}
              style={styles.icon} />
          )}
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
