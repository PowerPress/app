import {goBack, push} from 'connected-react-router'

import {client} from '../rpc/client'
import {setErrHandler} from '../rpc/rpc'

import * as grpc from '@grpc/grpc-js'

import * as queryString from 'query-string'

// import emoji from 'node-emoji'

import {runtimeStatus, RuntimeStatusResponse, WatchEvent, RPCError, RPCState, ErrFn} from '../rpc/rpc'
import {Key, KeyType, User} from '../rpc/types'

import {AppState} from '../reducers/app'

export type State = {
  app: AppState
  rpc: RPCState
  router: any
}

export {goBack, push}

export const init = () => (dispatch: (action: any) => void, getState: () => State) => {
  setErrHandler((err: RPCError, errFn: ErrFn) => {
    if (err.code === grpc.status.PERMISSION_DENIED) {
      dispatch({type: 'LOCK'})
    } else if (!errFn) {
      dispatch(errors(new Error(err.message)))
    }
  })

  dispatch(
    runtimeStatus({}, (resp: RuntimeStatusResponse) => {
      console.log('Status:', resp)
      if (!resp.authSetupNeeded) {
        dispatch(push('/key/create'))
      } else {
        dispatch(startWatchStream())
        dispatch(push('/keys/index'))
      }
    })
  )
}

export const errors = (err: Error) => (dispatch: (action: any) => any) => {
  console.error('Dispatch', err)
  dispatch({
    type: 'ERROR',
    payload: {error: err},
  })
}

let watchCall
export const startWatchStream = () => async (dispatch: (action: any) => any) => {
  if (watchCall) {
    console.warn('Watch call already on')
    return
  }
  console.log('Start watch stream')
  const syncStarted = new Date().getTime()
  const cl = await client()
  watchCall = cl.watch({})
  watchCall.on('data', (event: WatchEvent) => {
    console.log('Watch event:', event)
    dispatch({type: 'WATCH_STATUS', payload: {status: event.status}})
    // TODO: Update inbox
  })
  // watchCall.on('status', status => {
  //   console.log('Watch stream status:', status)
  // })
  watchCall.on('end', () => {
    watchCall = null
    console.log('Watch stream end (duration: %sms)', new Date().getTime() - syncStarted)
    // dispatch(errors(new Error('Watch stream ended')))
    dispatch({type: 'WATCH_STATUS', payload: {status: 'OUTAGE'}})
  })
  watchCall.on('error', err => {
    watchCall = null

    if (err.code === grpc.status.PERMISSION_DENIED) {
      console.error('Watch stream perission denied')
      dispatch({type: 'LOCK'})
      return
    }

    console.error('Watch stream error (duration: %sms): %s', new Date().getTime() - syncStarted, err)
    dispatch(errors(err))
  })
}

// TODO: Notify service of connectivity
// const onlineFn = () => {
//   console.log('Online')
// }
// const offlineFn = () => {
//   console.log('Offline')
// }
// window.addEventListener('online', onlineFn)
// window.addEventListener('offline', offlineFn)

export const keyEmpty = (): Key => ({
  id: '',
  users: [],
  type: KeyType.NO_KEY_TYPE,
  saved: false,
})

export const userEmpty = (): User => ({
  kid: '',
  seq: 0,
  service: '',
  name: '',
  url: '',
  err: '',
  verifiedAt: 0,
})

export const selectedKID = (state: {rpc: RPCState; router: any}) => {
  const values = queryString.parse(state.router.location.search)
  return (values.kid || '').toString()
}