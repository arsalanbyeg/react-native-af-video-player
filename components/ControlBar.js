import React from 'react'
import PropTypes from 'prop-types'
import { StyleSheet, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { ToggleIcon, Time, Scrubber, Speed } from './'

const styles = StyleSheet.create({
	upperCont: {
		flexDirection: "row",
		height: 30
	},
	lowerCont: {
		flexDirection: "row",
		height: 40,
		justifyContent: "space-between"
	},
	leftCont: {
		flex: 0.25,
		justifyContent: "flex-start"
	},
	middleCont: {
		flex: 0.4,
		flexDirection: "row",
		justifyContent: "center"
	},
	rightCont: {
		flex: 0.25,
		flexDirection: "row",
		justifyContent: "flex-end"
	}
});

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
		inlineOnly,
		captions,
		toggleCaptions,
		paused,
		togglePlay
	} = props

	let noOfTaps = 0;
	let lastPressTime = 0;
	let timeout;

	forwardRewindVideo = (seconds, add) => { // add = true is for add and false for subtract
		noOfTaps = 0;
		const currentTime = props.currentTime;
		if (add ? (currentTime < (props.duration - seconds)) : (currentTime > seconds)) {
			const offsetTime = add ? seconds : -seconds;
			props.forward(currentTime + offsetTime);
		}
	};

	_seekTo = (action) => {
		const time = new Date().getTime();
		const delta = time - lastPressTime;

		if (noOfTaps > 0 && delta < 1000) {
			++noOfTaps;
			clearTimeout(timeout);
			timeout = setTimeout(() => forwardRewindVideo(10 * noOfTaps, action), 1000);
		} else {
			++noOfTaps;
			clearTimeout(timeout);
			timeout = setTimeout(() => forwardRewindVideo(10 * noOfTaps, action), 1000);
		}

		lastPressTime = time;
	};

	return (
		<LinearGradient colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.75)']}>
			<View style={styles.upperCont}>
				<Time time={currentTime} theme={theme.seconds} />
				<Scrubber
					onSeek={pos => onSeek(pos)}
					onSeekRelease={pos => onSeekRelease(pos)}
					progress={progress}
					theme={{ scrubberThumb: theme.scrubberThumb, scrubberBar: theme.scrubberBar }}
				/>
				<Time time={duration} theme={theme.duration} />
			</View>
			<View style={styles.lowerCont}>
				<View style={styles.leftCont}>
					<Speed
						paddingLeft
						paddingRight
						theme={theme.volume}
						onPress={() => props.speed()}
						size={18}
						currentSpeed={currentSpeed}
					/>
				</View>
				<View style={styles.middleCont}>
					<ToggleIcon
						paddingLeft
						paddingRight
						theme={theme.volume}
						onPress={() => _seekTo(false)}
						isOn={true}
						iconOff="replay-10"
						iconOn="replay-10"
						size={25}
					/>
					<ToggleIcon
						paddingLeft
						paddingRight
						theme={theme.volume}
						onPress={() => togglePlay()}
						isOn={paused}
						iconOff="pause"
						iconOn="play-arrow"
						size={40}
					/>
					<ToggleIcon
						paddingLeft
						paddingRight
						theme={theme.volume}
						onPress={() => _seekTo(true)}
						isOn={true}
						iconOff="forward-10"
						iconOn="forward-10"
						size={25}
					/>
				</View>
				<View style={styles.rightCont}>
					{captions &&
						<ToggleIcon
							paddingLeft
							paddingRight
							onPress={toggleCaptions}
							iconOff="closed-caption"
							iconOn="closed-caption"
							isOn={captions}
							theme={theme.fullscreen}
						/>
					}
					{!inlineOnly &&
						<ToggleIcon
							paddingLeft
							paddingRight
							onPress={() => props.toggleFS()}
							iconOff="fullscreen"
							iconOn="fullscreen-exit"
							isOn={fullscreen}
							theme={theme.fullscreen}
						/>}
				</View>
			</View>
		</LinearGradient>
	);
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
	theme: PropTypes.object.isRequired,
	captions: PropTypes.bool.isRequired,
	toggleCaptions: PropTypes.func.isRequired
}

export { ControlBar }
