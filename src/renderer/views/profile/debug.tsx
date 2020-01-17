import * as React from 'react'

import {Box, Button, Divider, Typography} from '@material-ui/core'

import {connect} from 'react-redux'

import {push, goBack} from 'connected-react-router'

import {routes} from '../routes'

import {styles, Link} from '../components'

import {RPCState} from '../../rpc/rpc'

import {RouteInfo} from '../routes'

type Props = {
  dispatch: (action: any) => any
}

const cstyles = {
  label: {
    paddingRight: 7,
    marginRight: 7,
    minWidth: 120,
    fontWeight: 600,
  },
  section: {
    paddingBottom: 20,
  },
}

class Debug extends React.Component<Props> {
  push = (route: string) => {
    const r = route
    return () => {
      this.props.dispatch(push(r))
    }
  }

  error = () => {
    throw new Error('error!')
  }

  renderDebugActions() {
    return (
      <Box display="flex" flexDirection="row" style={cstyles.section}>
        <Typography style={{...cstyles.label}}>Debug</Typography>
        <Box>
          <Link onClick={() => this.props.dispatch(push('/db'))}>Show DB</Link>
        </Box>
      </Box>
    )
  }

  renderRoutes() {
    return (
      <Box display="flex" flexDirection="row" style={cstyles.section}>
        <Typography style={{...cstyles.label}}>Routes</Typography>
        <Box>
          {routes.map((r: RouteInfo) => (
            <Box display="flex" flexDirection="row" key={r.path}>
              <Link onClick={this.push(r.path)}>{r.path}</Link>
            </Box>
          ))}
        </Box>
      </Box>
    )
  }

  render() {
    return <Box>{this.renderRoutes()}</Box>
  }
}

const mapStateToProps = (state: {rpc: RPCState}, ownProps: any): any => {
  return {}
}

// $FlowFixMe
export default connect(mapStateToProps)(Debug)