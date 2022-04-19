import React from 'react'
import { StyleSheet } from 'react-native'
import { translate } from '../lib/i18n'
import { PV } from '../resources'
import { Text, View } from './'

type Props = {
  hasZebraStripe?: boolean
  name?: string
  onPress?: any
  testID: string
}

export class ProfileTableCell extends React.PureComponent<Props> {
  render() {
    const { hasZebraStripe, name = '', onPress, testID } = this.props

    return (
      <View
        accessible
        accessibilityHint={translate('ARIA HINT - tap to go to this profile')}
        accessibilityLabel={name.trim() || translate('anonymous')}
        hasZebraStripe={hasZebraStripe}
        style={styles.wrapper}>
        <Text onPress={onPress} style={styles.name} testID={testID}>
          {name.trim() || translate('anonymous')}
        </Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  name: {
    flex: 1,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold
  },
  wrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    minHeight: PV.Table.cells.standard.height,
    paddingLeft: 8,
    paddingRight: 8
  }
})
