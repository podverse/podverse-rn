import { Config } from "react-native-config";

export const debugLogger = (message: string, data?: any) => {
  if (!!Config.IS_DEV) {
    if (data) {
      console.log(message)
      console.log(data)
    } else {
      console.log(message)
    }
  }
}

export const errorLogger = (fileName: string, functionName: string, error: any) => {
  console.error(fileName)
  console.error(functionName)
  console.error(error)
}
