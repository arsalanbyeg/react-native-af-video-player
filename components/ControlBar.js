import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { ToggleIcon, Time, Scrubber, Speed } from './'

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 35,
    alignSelf: 'stretch',
    justifyContent: 'flex-end'
  }
})

const ControlBar = (props) => {
  const {
    onSeek,
    onSeekRelease,
    progress,
    currentTime,
    currentSpeed,
    duration,
    muted,
    fullscreen,
    theme,
    inlineOnly
  } = props

  _seekTo = (action) => {
    var seekTime = (action) ? (props.currentTime - 30) : (props.currentTime + 30);
    if (seekTime < 0) {
      seekTime = 0;
    }
    else if(seekTime > props.duration) {
      seekTime = props.duration
    }
    props.forward(seekTime);
  }
  return (
    <LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']} style={styles.container}>
      <ToggleIcon
        paddingLeft
        theme={theme.volume}
        onPress={() => _seekTo(true)}
        isOn={true}
        iconOff="replay-30"
        iconOn="replay-30"
        size={20}
      />
      <ToggleIcon
        paddingLeft
        theme={theme.volume}
        onPress={() => _seekTo(false)}
        isOn={true}
        iconOff="forward-30"
        iconOn="forward-30"
        size={20}
      />
      <Time time={currentTime} theme={theme.seconds} />
      <Scrubber
        onSeek={pos => onSeek(pos)}
        onSeekRelease={pos => onSeekRelease(pos)}
        progress={progress}
        theme={{ scrubberThumb: theme.scrubberThumb, scrubberBar: theme.scrubberBar }}
      />
      <ToggleIcon
        paddingLeft
        theme={theme.volume}
        onPress={() => props.toggleMute()}
        isOn={muted}
        iconOff="volume-up"
        iconOn="volume-mute"
        size={20}
      />
      <Speed
        paddingLeft
        theme={theme.volume}
        onPress={() => props.speed()}
        size={15}
        currentSpeed={currentSpeed}
      />
      <Time time={duration} theme={theme.duration} />
      { !inlineOnly &&
      <ToggleIcon
        paddingRight
        onPress={() => props.toggleFS()}
        iconOff="fullscreen"
        iconOn="fullscreen-exit"
        isOn={fullscreen}
        theme={theme.fullscreen}
      />}
    </LinearGradient>
  )
}

ControlBar.propTypes = {
  toggleFS: PropTypes.func.isRequired,
  toggleMute: PropTypes.func.isRequired,
  onSeek: PropTypes.func.isRequired,
  onSeekRelease: PropTypes.func.isRequired,
  rewind: PropTypes.func.isRequired,
  forward: PropTypes.func.isRequired,
  fullscreen: PropTypes.bool.isRequired,
  speed: PropTypes.func,
  muted: PropTypes.bool.isRequired,
  inlineOnly: PropTypes.bool.isRequired,
  progress: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  currentSpeed: PropTypes.number.isRequired,
  duration: PropTypes.number.isRequired,
  theme: PropTypes.object.isRequired
}

export { ControlBar }
