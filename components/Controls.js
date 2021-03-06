import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	View,
	Animated,
	StyleSheet,
	TouchableWithoutFeedback as Touchable
} from "react-native";
import { PlayButton, ControlBar, Loading, TopBar, ProgressBar } from "./";

const styles = StyleSheet.create({
	mainCont: {
		justifyContent: "space-between"
	},
	container: {
		...StyleSheet.absoluteFillObject,
		zIndex: 99
	},
	flex: {
		flex: 1
	},
	playBtnCont: {
		position: "absolute",
		width: "100%",
		height: "100%"
	}
});

class Controls extends Component {
	constructor() {
		super();
		this.state = {
			hideControls: false,
			seconds: 0,
			seeking: false
		};
		this.animControls = new Animated.Value(1);
		this.scale = new Animated.Value(1);
		this.progressbar = new Animated.Value(2);
	}

	componentDidMount() {
		this.setTimer();
	}

	componentWillUnmount() {
		clearInterval(this.timer);
	}

	onSeek(pos) {
		this.props.onSeek(pos);
		if (!this.state.seeking) {
			this.setState({ seeking: true });
		}
	}

	onSeekRelease(pos) {
		this.props.onSeekRelease(pos);
		this.setState({ seeking: false, seconds: 0 });
	}

	onFastForward = (pos) => {
		this.setState({ seconds: 0 });
		this.props.forward(pos);
	};

	setTimer() {
		this.timer = setInterval(() => {
			switch (true) {
				case this.state.seeking:
					// do nothing
					break;
				case this.props.paused:
					if (this.state.seconds > 0) this.setState({ seconds: 0 });
					break;
				case this.state.hideControls:
					break;
				case this.state.seconds > 3:
					if (!this.props.paused) this.hideControls();
					break;
				default:
					this.setState({ seconds: this.state.seconds + 1 });
			}
		}, 1000);
	}

	showControls() {
		this.setState({ hideControls: false }, () => {
			this.props.onControlToggle(this.state.hideControls);
			this.progressbar.setValue(2);
			Animated.parallel([
				Animated.timing(this.animControls, { toValue: 1, duration: 200 }),
				Animated.timing(this.scale, { toValue: 1, duration: 200 })
			]).start();
		});
	}

	hideControls() {
		Animated.parallel([
			Animated.timing(this.animControls, { toValue: 0, duration: 200 }),
			Animated.timing(this.scale, { toValue: 0.25, duration: 200 })
		]).start(() =>  this.setState({ hideControls: true, seconds: 0 } , ()=>{
			this.props.onControlToggle(this.state.hideControls);
		}));
	}

	hiddenControls() {
		Animated.timing(this.progressbar, { toValue: 0, duration: 200 }).start();
		return (
			<Touchable style={styles.container} onPress={() => this.showControls()}>
				<Animated.View
					style={[styles.container, { paddingBottom: this.progressbar }]}
				>
					<ProgressBar
						theme={this.props.theme.progress}
						progress={this.props.progress}
					/>
				</Animated.View>
			</Touchable>
		);
	}

	loading() {
		return (
			<View style={styles.container}>
				<Loading theme={this.props.theme.loading} />
			</View>
		);
	}

	displayedControls() {
		const {
			paused,
			fullscreen,
			muted,
			loading,
			logo,
			more,
			onMorePress,
			title,
			progress,
			currentTime,
			currentSpeed,
			duration,
			theme,
			inlineOnly,
			captions,
			toggleCaptions
		} = this.props;

		const { center, ...controlBar } = theme;

		return (
			<Touchable onPress={() => this.hideControls()}>
				<Animated.View
					style={[styles.container, styles.mainCont, { opacity: this.animControls }]}
				>
					<TopBar
						title={title}
						logo={logo}
						more={more}
						onMorePress={() => onMorePress()}
						theme={{ title: theme.title, more: theme.more }}
					/>
					<Animated.View
						style={[styles.flex, styles.playBtnCont, { transform: [{ scale: this.scale }] }]}
					>
						<PlayButton
							onPress={() => this.props.togglePlay()}
							paused={paused}
							loading={loading}
							theme={center}
						/>
					</Animated.View>
					<ControlBar
						toggleFS={() => this.props.toggleFS()}
						toggleMute={() => this.props.toggleMute()}
						togglePlay={() => this.props.togglePlay()}
						rewind={pos => this.props.rewind(pos)}
						forward={this.onFastForward}
						speed={() => this.props.speed()}
						muted={muted}
						paused={paused}
						fullscreen={fullscreen}
						onSeek={pos => this.onSeek(pos)}
						onSeekRelease={pos => this.onSeekRelease(pos)}
						progress={progress}
						currentTime={currentTime}
						currentSpeed={currentSpeed}
						duration={duration}
						theme={controlBar}
						inlineOnly={inlineOnly}
						captions={captions}
						toggleCaptions={toggleCaptions}
					/>
				</Animated.View>
			</Touchable>
		);
	}

	render() {
		if (this.props.loading) return this.loading();
		if (this.state.hideControls) {
			return this.hiddenControls();
		}
		return this.displayedControls();
	}
}

Controls.propTypes = {
	toggleFS: PropTypes.func.isRequired,
	toggleMute: PropTypes.func.isRequired,
	togglePlay: PropTypes.func.isRequired,
	onSeek: PropTypes.func.isRequired,
	onSeekRelease: PropTypes.func.isRequired,
	rewind: PropTypes.func.isRequired,
	forward: PropTypes.func.isRequired,
	speed: PropTypes.func.isRequired,
	onMorePress: PropTypes.func.isRequired,
	paused: PropTypes.bool.isRequired,
	inlineOnly: PropTypes.bool.isRequired,
	fullscreen: PropTypes.bool.isRequired,
	muted: PropTypes.bool.isRequired,
	more: PropTypes.bool.isRequired,
	loading: PropTypes.bool.isRequired,
	progress: PropTypes.number.isRequired,
	currentTime: PropTypes.number.isRequired,
	currentSpeed: PropTypes.number.isRequired,
	duration: PropTypes.number.isRequired,
	title: PropTypes.string.isRequired,
	logo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	theme: PropTypes.object.isRequired,
	captions: PropTypes.bool.isRequired,
	toggleCaptions: PropTypes.func.isRequired
};

export { Controls };
