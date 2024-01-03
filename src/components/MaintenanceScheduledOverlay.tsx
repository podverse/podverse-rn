import { StyleSheet } from 'react-native'
import React from 'reactn'
import { translate } from '../lib/i18n'
import { readableDate } from '../lib/utility'
import { PV } from '../resources'
import { Button, SafeAreaView, ScrollView, Text, View } from '.'

type Props = {
  endTime: Date
  handleConfirmPress: () => unknown
  navigation: any
  startTime: Date
}

const testIDPrefix = 'maintenance_scheduled_overlay'

export const MaintenanceScheduledOverlay = ({ handleConfirmPress, startTime, endTime }: Props) => {
  const withTime = true
  const start = readableDate(startTime, withTime)
  const end = readableDate(endTime, withTime)

  return (
    <SafeAreaView testID={`${testIDPrefix}_view`}>
      <ScrollView contentContainerStyle={styles.view}>
        <View accessible>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={styles.header}>
            {translate('Maintenance scheduled title')}
          </Text>
          <Text fontSizeLargestScale={PV.Fonts.largeSizes.sm} style={styles.message}>
            {translate('Maintenance scheduled message', { startTime: start, endTime: end })}
          </Text>
        </View>
        <Button
          accessible
          accessibilityLabel={translate('OK')}
          onPress={handleConfirmPress}
          testID={`${testIDPrefix}_ok_button`}
          text={translate('OK')}
          wrapperStyles={styles.button}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  button: {
    marginVertical: 16,
    borderRadius: 8,
    maxWidth: 300,
    width: '100%'
  },
  header: {
    fontSize: PV.Fonts.sizes.xxxl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 24,
    textAlign: 'center'
  },
  message: {
    fontSize: PV.Fonts.sizes.xl,
    marginBottom: 64,
    textAlign: 'center'
  },
  scrollView: {
    paddingVertical: 16
  },
  view: {
    flex: 1,
    marginBottom: 32,
    marginHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center'
  }
})
