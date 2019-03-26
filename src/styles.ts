import { StyleSheet } from 'react-native'
import { PV } from './resources'

const uiMode = 'dark'
let uiColors = {} as any

if (uiMode === 'dark') {
  uiColors = {
    app: {
      backgroundColor: PV.Colors.black
    },
    brandColor: PV.Colors.brandColor,
    button: {
      border: {
        primary: PV.Colors.grayDarker
      },
      text: {
        primary: PV.Colors.white,
        secondary: PV.Colors.grayLight
      }
    },
    text: {
      primary: PV.Colors.white,
      secondary: PV.Colors.grayLight
    },
    divider: PV.Colors.grayDarker
  }
} else {
  console.log('light mode')
}

export const colors = uiColors

export const darkTheme = StyleSheet.create({
  view: {
    backgroundColor: PV.Colors.black
  },
  text: {
    color: PV.Colors.white
  },
  tabbar: {
    backgroundColor: PV.Colors.black
  },
  tabbarItem: {
    tintColor: PV.Colors.blue
  }
})

export const lightTheme = StyleSheet.create({
  view: {
    backgroundColor: PV.Colors.white
  },
  text: {
    color: PV.Colors.black
  },
  tabbar: {
    backgroundColor: PV.Colors.white
  },
  tabbarItem: {
    tintColor: PV.Colors.blue
  }
})

export const core = StyleSheet.create({
  text: {
    color: colors.text.primary
  },
  view: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  }
})

export const button = StyleSheet.create({
  primaryWrapper: {
    borderColor: colors.button.border.primary,
    borderWidth: 1,
    height: 50,
    width: 200
  },
  primaryWrapperDisabled: {
    borderColor: colors.button.border.secondary
  },
  primaryText: {
    color: colors.button.text.primary
  },
  primaryTextDisabled: {
    color: colors.button.text.secondary
  }
})

export const table = StyleSheet.create({
  cellWrapper: {
    height: 50,
    justifyContent: 'center'
  },
  cellText: {
    color: colors.text.primary
  }
})
