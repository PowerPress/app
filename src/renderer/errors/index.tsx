import * as React from 'react'

import {Box, Button, Typography} from '@material-ui/core'

import ErrorView from './view'

type Props = {
  error: Error | void
  clearError?: () => void
  restart: () => void
}

export default class ErrorsView extends React.Component<Props> {
  render() {
    return (
      <Box
        display="flex"
        flexDirection="column"
        flex={1}
        style={{
          backgroundColor: 'white',
          height: '100%',
        }}
      >
        <Box className="drag" style={{width: '100%', height: 40, cursor: 'move'}} />
        <Typography
          variant="h5"
          style={{
            paddingBottom: 20,
            fontFamily: 'Roboto Mono',
            textAlign: 'center',
          }}
          color="secondary"
        >
          Ah shucks! Something isn't working right.
        </Typography>
        <ErrorView error={this.props.error} />
        <Box display="flex" flexDirection="row" paddingTop={2} paddingBottom={2} alignSelf="center">
          <Button color="secondary" variant="contained" onClick={this.props.restart}>
            Restart the App
          </Button>
          <Box style={{width: 10}} />
          {this.props.clearError && (
            <Button variant="outlined" onClick={this.props.clearError}>
              Clear Error
            </Button>
          )}
        </Box>
      </Box>
    )
  }
}