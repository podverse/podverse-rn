export const Alerts = {
  NETWORK_ERROR: {
    message: (str?: string) => !str ? 'Internet connection required' : `Please connect to the internet to ${str}.`,
    title: 'Network Error'
  }
}
