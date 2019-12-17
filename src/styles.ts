import { StyleSheet } from 'react-native'
import { PV } from './resources'

export const darkTheme = StyleSheet.create({
  actionSheetButton: {
    backgroundColor: PV.Colors.grayDarkest,
    borderColor: PV.Colors.grayDark
  },
  actionSheetButtonCancel: {
    backgroundColor: PV.Colors.grayDarker,
    borderColor: PV.Colors.grayDark
  },
  actionSheetButtonDelete: {
    backgroundColor: PV.Colors.grayDarkest,
    borderColor: PV.Colors.grayDark
  },
  actionSheetButtonDisabled: {
    backgroundColor: PV.Colors.grayDarkest
  },
  actionSheetButtonText: {
    color: PV.Colors.white
  },
  actionSheetButtonTextDelete: {
    color: PV.Colors.redLighter
  },
  actionSheetButtonTextCancel: {
    color: PV.Colors.white
  },
  actionSheetButtonTextDisabled: {
    color: PV.Colors.grayLightest
  },
  actionSheetButtonUnderlay: {
    backgroundColor: PV.Colors.grayDarker
  },
  actionSheetButtonCancelUnderlay: {
    backgroundColor: PV.Colors.grayDark
  },
  actionSheetHeaderText: {
    color: PV.Colors.grayLighter
  },
  actionSheetView: {
    backgroundColor: PV.Colors.grayDarker
  },
  activityIndicator: {
    color: PV.Colors.grayLighter
  },
  activityIndicatorAlternate: {
    color: PV.Colors.grayDarkest
  },
  buttonActive: {
    color: PV.Colors.blueLighter
  },
  buttonError: {
    color: PV.Colors.red
  },
  buttonGroup: {
    backgroundColor: PV.Colors.grayDarkest
  },
  buttonGroupSelected: {
    backgroundColor: PV.Colors.grayDark
  },
  buttonGroupText: {
    color: PV.Colors.grayLighter
  },
  buttonGroupTextSelected: {
    color: PV.Colors.white
  },
  buttonImage: {
    borderColor: PV.Colors.white,
    tintColor: PV.Colors.white
  },
  buttonPrimaryText: {
    color: PV.Colors.white
  },
  buttonPrimaryTextDisabled: {
    color: PV.Colors.gray
  },
  buttonPrimaryWrapper: {
    borderColor: PV.Colors.grayDarker
  },
  buttonPrimaryWrapperDisabled: {
    backgroundColor: PV.Colors.grayLighter
  },
  divider: {
    backgroundColor: PV.Colors.grayDarker
  },
  flatList: {
    backgroundColor: PV.Colors.black
  },
  inputContainerText: {
    backgroundColor: PV.Colors.black,
    borderColor: PV.Colors.grayDarker
  },
  link: {
    color: PV.Colors.blueLighter
  },
  makeClipPlayerControlsWrapper: {
    backgroundColor: PV.Colors.grayDarker
  },
  membershipTextExpired: {
    color: PV.Colors.red
  },
  membershipTextExpiring: {
    color: PV.Colors.yellow
  },
  membershipTextPremium: {
    color: PV.Colors.blue
  },
  modalBackdrop: {
    backgroundColor: '#00000075'
  },
  modalInnerWrapper: {
    backgroundColor: PV.Colors.grayDarkest
  },
  overlayAlertDanger: {
    backgroundColor: PV.Colors.redLighter,
    color: PV.Colors.white
  },
  overlayAlertInfo: {
    backgroundColor: PV.Colors.blueLighter,
    color: PV.Colors.grayDarkest
  },
  overlayAlertLink: {
    color: PV.Colors.white,
    textDecorationLine: 'underline'
  },
  overlayAlertWarning: {
    backgroundColor: PV.Colors.yellow,
    color: PV.Colors.white
  },
  placeholderText: {
    color: PV.Colors.grayLighter
  },
  player: {
    borderColor: PV.Colors.grayDarker
  },
  playerClipTimeFlag: {
    backgroundColor: PV.Colors.yellow
  },
  playerText: {
    color: PV.Colors.white
  },
  swipeRowBack: {
    backgroundColor: PV.Colors.gray,
    color: PV.Colors.white
  },
  tabbar: {
    backgroundColor: PV.Colors.black,
    borderTopWidth: 1,
    borderTopColor: PV.Colors.grayDarker
  },
  tabbarItem: {
    tintColor: PV.Colors.blue
  },
  tableCellBorder: {
    borderColor: PV.Colors.grayDarker
  },
  tableCellTextPrimary: {
    color: PV.Colors.white
  },
  tableCellTextSecondary: {
    color: PV.Colors.white
  },
  tableSectionHeader: {
    backgroundColor: PV.Colors.grayDarker
  },
  tableSectionHeaderIcon: {
    color: PV.Colors.white
  },
  tableSectionHeaderText: {
    color: PV.Colors.white
  },
  text: {
    color: PV.Colors.white
  },
  textInput: {
    backgroundColor: PV.Colors.grayDarker,
    color: PV.Colors.white
  },
  textInputIcon: {
    backgroundColor: PV.Colors.grayDarker,
    color: PV.Colors.white
  },
  textInputWrapper: {
    backgroundColor: PV.Colors.black,
    borderColor: PV.Colors.grayDarker
  },
  textSecondary: {
    color: PV.Colors.grayLighter
  },
  view: {
    backgroundColor: PV.Colors.black
  }
})

export const lightTheme = StyleSheet.create({
  actionSheetButton: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter
  },
  actionSheetButtonCancel: {
    backgroundColor: PV.Colors.grayLightest,
    borderColor: PV.Colors.grayLighter
  },
  actionSheetButtonDelete: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter,
    color: PV.Colors.redDarker
  },
  actionSheetButtonDisabled: {
    backgroundColor: PV.Colors.white
  },
  actionSheetButtonText: {
    color: PV.Colors.black
  },
  actionSheetButtonTextCancel: {
    color: PV.Colors.black
  },
  actionSheetButtonTextDelete: {
    color: PV.Colors.red
  },
  actionSheetButtonTextDisabled: {
    color: PV.Colors.grayDarkest
  },
  actionSheetButtonUnderlay: {
    backgroundColor: PV.Colors.grayLightest
  },
  actionSheetButtonCancelUnderlay: {
    backgroundColor: PV.Colors.grayLighter
  },
  actionSheetHeaderText: {
    color: PV.Colors.grayDarker
  },
  activityIndicator: {
    color: PV.Colors.grayDarker
  },
  activityIndicatorAlternate: {
    color: PV.Colors.grayLightest
  },
  buttonActive: {
    color: PV.Colors.blueDarker
  },
  buttonError: {
    color: PV.Colors.red
  },
  buttonGroup: {
    backgroundColor: PV.Colors.grayLightest
  },
  buttonGroupSelected: {
    backgroundColor: PV.Colors.grayLight
  },
  buttonGroupText: {
    color: PV.Colors.grayDarker
  },
  buttonGroupTextSelected: {
    color: PV.Colors.black
  },
  buttonImage: {
    borderColor: PV.Colors.black,
    tintColor: PV.Colors.black
  },
  buttonPrimaryText: {
    color: PV.Colors.black
  },
  buttonPrimaryTextDisabled: {
    color: PV.Colors.gray
  },
  buttonPrimaryWrapper: {
    borderColor: PV.Colors.grayLighter
  },
  buttonPrimaryWrapperDisabled: {
    backgroundColor: PV.Colors.grayDarker
  },
  divider: {
    backgroundColor: PV.Colors.grayLighter
  },
  flatList: {
    backgroundColor: PV.Colors.white
  },
  inputContainerText: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter
  },
  link: {
    color: PV.Colors.blueDarker
  },
  makeClipPlayerControlsWrapper: {
    backgroundColor: PV.Colors.grayLighter
  },
  membershipTextExpired: {
    color: PV.Colors.red
  },
  membershipTextExpiring: {
    color: PV.Colors.yellow
  },
  membershipTextPremium: {
    color: PV.Colors.blue
  },
  modalBackdrop: {
    backgroundColor: '#00000075'
  },
  modalInnerWrapper: {
    backgroundColor: PV.Colors.grayLightest
  },
  overlayAlertDanger: {
    backgroundColor: PV.Colors.redLighter,
    color: PV.Colors.grayDarkest
  },
  overlayAlertInfo: {
    backgroundColor: PV.Colors.blueLighter,
    color: PV.Colors.grayDarkest
  },
  overlayAlertLink: {
    color: PV.Colors.blueDarker
  },
  overlayAlertWarning: {
    backgroundColor: PV.Colors.yellow,
    color: PV.Colors.grayDarkest
  },
  placeholderText: {
    color: PV.Colors.grayDarker
  },
  player: {
    borderColor: PV.Colors.grayLighter
  },
  playerClipTimeFlag: {
    backgroundColor: PV.Colors.yellow
  },
  playerText: {
    color: PV.Colors.black
  },
  swipeRowBack: {
    backgroundColor: PV.Colors.gray,
    color: PV.Colors.black
  },
  tabbar: {
    backgroundColor: PV.Colors.white,
    borderTopWidth: 1,
    borderTopColor: PV.Colors.grayLighter
  },
  tabbarItem: {
    tintColor: PV.Colors.blue
  },
  tableCellBorder: {
    borderColor: PV.Colors.grayLighter
  },
  tableCellTextPrimary: {
    color: PV.Colors.black
  },
  tableCellTextSecondary: {
    color: PV.Colors.white
  },
  tableSectionHeader: {
    backgroundColor: PV.Colors.grayLighter
  },
  tableSectionHeaderIcon: {
    color: PV.Colors.black
  },
  tableSectionHeaderText: {
    color: PV.Colors.black
  },
  text: {
    color: PV.Colors.black
  },
  textInput: {
    backgroundColor: PV.Colors.grayLighter,
    color: PV.Colors.black
  },
  textInputIcon: {
    backgroundColor: PV.Colors.grayLighter,
    color: PV.Colors.black
  },
  textInputWrapper: {
    backgroundColor: PV.Colors.white,
    borderColor: PV.Colors.grayLighter
  },
  textSecondary: {
    color: PV.Colors.grayDarker
  },
  view: {
    backgroundColor: PV.Colors.white
  }
})

export const button = StyleSheet.create({
  iconOnlyLarge: {
    flex: 0,
    height: 76,
    lineHeight: 76,
    textAlign: 'center',
    width: 56
  },
  iconOnlyMedium: {
    flex: 0,
    height: 60,
    lineHeight: 60,
    textAlign: 'center',
    width: 56
  },
  iconOnlySmall: {
    flex: 0,
    height: 38,
    lineHeight: 38,
    textAlign: 'center',
    width: 56
  },
  iconOnlyAlignToTop: {
    flex: 0,
    marginBottom: 'auto',
    marginTop: 5,
    padding: 8
  },
  primaryWrapper: {
    alignItems: 'center',
    borderWidth: 1,
    height: 50,
    justifyContent: 'center',
    width: 200
  }
})

export const core = StyleSheet.create({
  activityIndicator: {
    flex: 1
  },
  backgroundView: {
    flex: 1
  },
  ListHeaderComponent: {
    borderBottomWidth: 0,
    borderTopWidth: 0,
    flex: 0,
    height: PV.FlatList.searchBar.height,
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 12
  },
  row: {
    backgroundColor: 'transparent',
    flexDirection: 'row'
  },
  searchBar: {
    borderBottomWidth: 1,
    borderWidth: 1
  },
  selectorIcon: {
    height: 44,
    lineHeight: 44,
    paddingLeft: 4,
    paddingRight: 12
  },
  selectorText: {
    fontSize: PV.Fonts.sizes.xl,
    height: 44,
    lineHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  textInput: {
    fontSize: PV.Fonts.sizes.xl,
    height: 44,
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  textInputLabel: {
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.bold,
    marginBottom: 8
  },
  textInputSubTitle: {
    fontSize: PV.Fonts.sizes.md,
    marginVertical: 8
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})

export const hidePickerIconOnAndroidSectionSelector = (isDarkMode: boolean) => {
  return {
    inputAndroidContainer: {
      backgroundColor: isDarkMode ? PV.Colors.grayDarker : PV.Colors.grayLighter
    }
  }
}

export const hidePickerIconOnAndroidTransparent = (isDarkMode: boolean) => {
  return {
    inputAndroidContainer: {
      backgroundColor: isDarkMode ? PV.Colors.black : PV.Colors.red
    }
  }
}

export const navHeader = StyleSheet.create({
  buttonIcon: {
    color: PV.Colors.white,
    height: 44,
    lineHeight: 44,
    paddingHorizontal: 12
  },
  buttonText: {
    color: PV.Colors.white,
    fontSize: PV.Fonts.sizes.xl,
    height: 44,
    lineHeight: 44,
    marginRight: 4,
    paddingHorizontal: 12
  }
})

export const playerStyles = StyleSheet.create({
  icon: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'center',
    width: 60
  },
  iconDisabled: {
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
    paddingHorizontal: 12,
    paddingVertical: 4
  },
  iconLarge: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    width: 74
  }
})

export const table = StyleSheet.create({
  cellText: {
    flex: 0,
    fontSize: PV.Fonts.sizes.xl,
    fontWeight: PV.Fonts.weights.semibold,
    height: PV.Table.cells.standard.height,
    lineHeight: PV.Table.cells.standard.height,
    paddingLeft: 8
  }
})

export const iconStyles = {
  dark: {
    color: PV.Colors.white,
    underlayColor: PV.Colors.black
  },
  darkSecondary: {
    color: PV.Colors.grayLighter,
    underlayColor: PV.Colors.black
  },
  darkTertiary: {
    color: PV.Colors.gray,
    underlayColor: PV.Colors.gray
  },
  darkRed: {
    color: PV.Colors.redDarker,
    underlayColor: PV.Colors.black
  },
  light: {
    color: PV.Colors.black,
    underlayColor: PV.Colors.white
  },
  lightSecondary: {
    color: PV.Colors.grayDarker,
    underlayColor: PV.Colors.white
  },
  lightTertiary: {
    color: PV.Colors.gray,
    underlayColor: PV.Colors.gray
  },
  lightRed: {
    color: PV.Colors.redLighter,
    underlayColor: PV.Colors.white
  }
}

export const getMembershipTextStyle = (globalTheme: any, membershipStatus?: string) => {
  switch (membershipStatus) {
    case PV.MembershipStatus.FREE_TRIAL:
      return globalTheme.membershipTextPremium
    case PV.MembershipStatus.FREE_TRIAL_EXPIRED:
      return globalTheme.membershipTextExpired
    case PV.MembershipStatus.PREMIUM:
      return globalTheme.membershipTextPremium
    case PV.MembershipStatus.PREMIUM_EXPIRED:
      return globalTheme.membershipTextExpired
    case PV.MembershipStatus.PREMIUM_EXPIRING_SOON:
      return globalTheme.membershipTextExpiring
  }
}
