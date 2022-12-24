import { getExtensionFromUrl } from 'podverse-shared'
import { Platform } from 'react-native'
import RNFS, { DownloadFileOptions } from 'react-native-fs'
import Share, { ShareOptions } from 'react-native-share'
import { PV } from '../resources'
import { getBearerToken } from '../services/auth'
import { errorLogger } from './logger'
import { downloadCustomFileNameId } from './hash'
import { hasValidNetworkConnection } from './network'
import { getAppUserAgent } from './utility'

const podverseImagesPath = RNFS.DocumentDirectoryPath + '/podverse_images/'
const _fileName = 'src/lib/storage.ts'

/*
  Limit attempts to re-download an image that may already be in cache
  to once per user session.
*/
const downloadedImageCache = {} as any

export const deleteImageCache = async () => {
  try {
    const folderExists = await RNFS.exists(podverseImagesPath)
    if (folderExists) {
      await RNFS.unlink(podverseImagesPath)
    }
  } catch (error) {
    errorLogger(_fileName, 'deleteImageCache', error)
  }
}

export const downloadMyUserDataFile = async () => {
  try {
    const urlsApi = await PV.URLs.api()
    const bearerToken = await getBearerToken()
    const userAgent = getAppUserAgent()
    const filePath = `${RNFS.TemporaryDirectoryPath}/podverse-my-data.zip`

    const downloadOptions: DownloadFileOptions = {
      fromUrl: `${urlsApi.baseUrl}/user/download`,
      toFile: filePath,
      headers: {
        ...(bearerToken ? { Authorization: bearerToken } : {}),
        'User-Agent': userAgent
      }
    }

    await RNFS.downloadFile(downloadOptions).promise

    let base64Data = null
    const isAndroid = Platform.OS === 'android'
    if (isAndroid) {
      base64Data = await RNFS.readFile(filePath, 'base64')
    }

    const options: ShareOptions = {
      type: 'zip',
      url: isAndroid ? `data:application/zip;base64,${base64Data}` : filePath,
      filename: isAndroid ? 'podverse-my-data' : undefined
    }

    await Share.open(options)
    await RNFS.unlink(filePath)
  } catch (error) {
    errorLogger(_fileName, 'downloadMyUserDataFile', error)
  }
}

export const downloadImageFile = async (uri: string) => {
  try {
    if (downloadedImageCache[uri]) return

    const isConnected = await hasValidNetworkConnection()
    if (!isConnected) return

    downloadedImageCache[uri] = true

    const ext = getExtensionFromUrl(uri)
    const folderExists = await RNFS.exists(podverseImagesPath)

    if (!folderExists) {
      await RNFS.mkdir(podverseImagesPath)
    }

    const destination = podverseImagesPath + downloadCustomFileNameId(uri) + ext

    const downloadOptions: DownloadFileOptions = {
      fromUrl: uri.replace('http://', 'https://'),
      toFile: destination
    }

    await RNFS.downloadFile(downloadOptions).promise
  } catch (error) {
    errorLogger(_fileName, 'downloadImageFile', error)
  }
}

export const getSavedImageUri = async (uri: string) => {
  let fileExists = false
  const ext = getExtensionFromUrl(uri)
  const filePath = podverseImagesPath + downloadCustomFileNameId(uri) + ext

  try {
    fileExists = await RNFS.exists(filePath)
  } catch (error) {
    errorLogger(_fileName, 'getSavedImageUri', error)
  }

  if (fileExists) {
    return { exists: true, imageUrl: filePath }
  } else {
    return { exists: false, imageUrl: uri }
  }
}
