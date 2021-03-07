import React from 'react'
import { StyleSheet, View } from 'react-native'
import { useGlobal } from 'reactn'
import { testProps } from '../lib/utility'
import { PV } from '../resources'
import { Text, TextInput } from './'

type Props = {
  handleChangeText: any
  handleSubmitEditing?: any
  isSmallText?: boolean
  selectedNumber?: number | string | null
  subText?: string
  testID: string
  text: string
}

export const NumberSelectorWithText = (props: Props) => {
  const { handleChangeText, handleSubmitEditing, isSmallText, selectedNumber = 0, subText, testID, text } = props
  const [globalTheme] = useGlobal('globalTheme')
  const strNum = Number.isInteger(selectedNumber) ? selectedNumber.toString() : selectedNumber
  return (
    <View style={styles.outerWrapper}>
      <View style={styles.innerWrapper}>
        <TextInput
          autoCompleteType='off'
          fontSizeLargestScale={PV.Fonts.largeSizes.md}
          keyboardType='numeric'
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmitEditing}
          placeholderTextColor={globalTheme.placeholderText.color}
          returnKeyType='done'
          style={styles.textInput}
          testID={testID}
          value={strNum}
          wrapperStyle={{ marginBottom: 0 }}
        />
        <Text fontSizeLargestScale={PV.Fonts.largeSizes.md} style={isSmallText ? styles.smallText : styles.text}>
          {text}
        </Text>
      </View>
      {subText && (
        <Text
          fontSizeLargestScale={PV.Fonts.largeSizes.sm}
          style={[globalTheme.textSecondary, styles.subText]}
          {...(testID ? testProps(`${testID}_sub_text`) : {})}>
          {subText}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  innerWrapper: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  outerWrapper: {},
  smallText: {
    flex: 1,
    marginHorizontal: 12
  },
  subText: {
    marginTop: 12,
    fontSize: PV.Fonts.sizes.md
  },
  text: {
    flex: 1,
    fontSize: PV.Fonts.sizes.lg,
    fontWeight: PV.Fonts.weights.bold,
    marginHorizontal: 12
  },
  textInput: {
    fontSize: PV.Fonts.sizes.xxl,
    justifyContent: 'center',
    textAlign: 'center',
    width: 44,
    borderWidth: 0,
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0
  }
})
