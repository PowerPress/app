import * as getenv from 'getenv'

import * as grpc from '@grpc/grpc-js'
import * as protoLoader from '@grpc/proto-loader'

import * as fs from 'fs'

type RPC = {
  client: any
}

let rpc: RPC = {
  client: null,
}

export const initializeClient = (certPath: string, authToken: string, protoPath: string) => {
  console.log('Initializing client')

  console.log('Loading cert', certPath)
  const cert = fs.readFileSync(certPath, 'ascii')
  const auth = (serviceUrl, callback) => {
    const metadata = new grpc.Metadata()
    metadata.set('authorization', authToken)
    callback(null, metadata)
  }
  const callCreds = grpc.credentials.createFromMetadataGenerator(auth)
  const sslCreds = grpc.credentials.createSsl(Buffer.from(cert, 'ascii'))
  const creds = grpc.credentials.combineChannelCredentials(sslCreds, callCreds)

  console.log('Proto path:', protoPath)
  // TODO: Show error if proto path doesn't exist
  const packageDefinition = protoLoader.loadSync(protoPath, {arrays: true, enums: String, defaults: true})
  const protoDescriptor = grpc.loadPackageDefinition(packageDefinition)
  if (!protoDescriptor.service) {
    throw new Error('proto descriptor should have service package')
  }
  const serviceCls = protoDescriptor.service['Keys']
  if (!serviceCls) {
    throw new Error('proto descriptor should have a Keys service')
  }

  const port = getenv.int('KEYS_PORT', 10001)
  console.log('Using client on port', port)

  rpc = {
    client: new serviceCls('localhost:' + port, creds),
  }
}

export const client = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!rpc.client) {
      // Only happens in hot reload, we need to wait for main process to initializeClient.
      console.warn('Waiting for client init...')
      setTimeout(() => {
        if (rpc.client) resolve(rpc.client)
        else reject('No client available')
      }, 1000)
      return
    }
    return resolve(rpc.client)
  })
}
