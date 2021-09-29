import { request } from './request'

export const getSecureUrl = async (url: string) => {
    const response = await request({
      endpoint: '/tools/findHTTPS',
      method: 'POST',
      body: { url }
    })
  
    return response?.data
}