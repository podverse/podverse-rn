export const Alerts = {
  NETWORK_ERROR: {
    message: (str?: string) => !str ? 'Internet connection required' : `You must be connected to the internet to ${str}.`,
    title: 'Network Error'
  }
}
