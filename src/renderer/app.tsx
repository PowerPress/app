import * as React from 'react'

import Routes from './routes'
import {store} from './store'

import Nav from './nav'

import {Box} from '@material-ui/core'

import {keys} from './rpc/client'
import {Config} from '@keys-pub/tsclient/lib/keys'

export default (_: {}) => {
  React.useEffect(() => {
    return store.createReaction(
      (s) => ({
        location: s.location,
        history: s.history,
        navMinimized: s.navMinimized,
      }),
      (s) => {
        const config: Config = {
          app: {
            location: s.location,
            history: s.history,
            navMinimized: s.navMinimized,
          },
        }
        const set = async () => await keys.ConfigSet({name: 'app', config})
        set()
      }
    )
  }, [])

  return (
    <Box display="flex" flex={1} flexDirection="row" style={{height: '100%'}}>
      <Nav />
      <Routes />
    </Box>
  )
}
