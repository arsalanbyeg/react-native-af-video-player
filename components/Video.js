import React, { Component } from "react";
import PropTypes from "prop-types";
import {
	Text,
	StyleSheet,
	StatusBar,
	Dimensions,
	BackHandler,
	Animated,
	Image,
	Alert,
	Platform
} from "react-native";
import VideoPlayer, { TextTrackType } from "react-native-video";
import KeepAwake from "react-native-keep-awake";
import Orientation from "react-native-orientation";
import Icons from "react-native-vector-icons/MaterialIcons";
import { Controls, Subtitles } from "./";
import { checkSource } from "./utils";
const backgroundColor = "#000";

const textTrackTypes = {
	index: "index",
	disabled: "disabled"
};

const styles = StyleSheet.create({
	background: {
		backgroundColor,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 98
	},
	fullScreen: {
		...StyleSheet.absoluteFillObject
	},
	image: {
		...StyleSheet.absoluteFillObject,
		width: undefined,
		height: undefined,
		zIndex: 99
	},
	subtitlesContainer: (fullScreen , hideControls) => ({
		left: 0,
		right: 0,
		zIndex: 20,
		alignSelf: "center",
		position: "absolute",
		justifyContent: "center",
		bottom: fullScreen ? 40 : hideControls ? 20 : 70,
	}),
	subtitlesText: fullScreen => ({
		fontSize: fullScreen ? 15 : 12
	})
});

const defaultTheme = {
	title: "#FFF",
	more: "#FFF",
	center: "#FFF",
	fullscreen: "#FFF",
	volume: "#FFF",
	scrubberThumb: "#FFF",
	scrubberBar: "#FFF",
	seconds: "#FFF",
	duration: "#FFF",
	progress: "#FFF",
	loading: "#FFF"
};

class Video extends Component {
	constructor(props) {
		super(props);
		this.state = {
			paused: !props.autoPlay,
			muted: false,
			fullScreen: false,
			inlineHeight: props.windowSize.width * 0.5625,
			loading: false,
			videoLoaded: false,
			duration: 0,
			progress: 0,
			currentTime: 0,
			rate: this.props.rate,
			seeking: false,
			renderError: false,
			textTrackType: textTrackTypes.index,
			hideControls: false,
		};
		this.animInline = new Animated.Value(props.windowSize.width * 0.5625);
		this.animFullscreen = new Animated.Value(props.windowSize.width * 0.5625);
		this.BackHandler = this.BackHandler.bind(this);
		this.onRotated = this.onRotated.bind(this);
	}

	componentDidMount() {
		Dimensions.addEventListener("change", this.onRotated);
		BackHandler.addEventListener("hardwareBackPress", this.BackHandler);
	}

	componentWillUnmount() {
		Dimensions.removeEventListener("change", this.onRotated);
		BackHandler.removeEventListener("hardwareBackPress", this.BackHandler);
	}

	onLoadStart() {
		this.setState({ paused: true, loading: true });
	}

	onLoad(data) {
		if (!this.state.loading) return;
		// this.props.onLoad(data);
		const { height, width } = data.naturalSize;
		const ratio =
			(height === "undefined" || height == 0) && (width === "undefined" || width == 0) ? 9 / 16 : height / width;
		const inlineHeight = this.props.lockRatio
			? this.props.windowSize.width / this.props.lockRatio
			: this.props.windowSize.width * ratio;
		this.setState(
			{
				paused: !this.props.autoPlay,
				loading: false,
				videoLoaded: true,
				inlineHeight,
				duration: data.duration,
				progress: 0,
				currentTime: 0
			},
			() => {
				Animated.timing(this.animInline, {
					toValue: inlineHeight,
					duration: 200
				}).start();
				this.props.onLoad(data);
				this.player.seek(0);
				// this.props.onPlay(!this.state.paused);
				if (!this.state.paused) {
					KeepAwake.activate();
					if (this.props.fullScreenOnly) {
						this.setState({ fullScreen: true }, () => {
							this.props.onFullScreen(this.state.fullScreen);
							this.animToFullscreen(this.props.windowSize.height);
							if (this.props.rotateToFullScreen && !Platform.isPad) Orientation.lockToLandscape();
						});
					}
				}
			}
		);
	}

	onBuffer = ({ isBuffering }) => {
		if (this.state.videoLoaded && Platform.OS !== "ios" && (this.state.loading !== isBuffering)) {
			this.setState({ loading: isBuffering });
		}
	}

	onEnd() {
		this.props.onEnd();
		const { loop } = this.props;
		if (!loop) this.pause();
		this.onSeekRelease(0);
		this.setState({ currentTime: 0 }, () => {
			if (!loop) this.controls.showControls();
		});
	}

	onRotated({ window: { width, height } }) {
		// Add this condition incase if inline and fullscreen options are turned on
		if (this.props.inlineOnly) return;
		const orientation = width > height ? "LANDSCAPE" : "PORTRAIT";
		if (this.props.rotateToFullScreen) {
			if (orientation === "LANDSCAPE") {
				this.setState({ fullScreen: true }, () => {
					this.animToFullscreen(height);
					this.props.onFullScreen(this.state.fullScreen);
				});
				return;
			}
			if (orientation === "PORTRAIT") {
				this.setState(
					{
						fullScreen: false,
						paused: this.props.fullScreenOnly || this.state.paused
					},
					() => {
						this.animToInline();
						if (this.props.fullScreenOnly)
							this.props.onPlay(!this.state.paused);
						this.props.onFullScreen(this.state.fullScreen);
					}
				);
				return;
			}
		} else {
			this.animToInline();
		}
		if (this.state.fullScreen) this.animToFullscreen(height);
	}

	onSeekRelease(percent) {
		const seconds = percent * this.state.duration;
		this.setState({ progress: percent, seeking: false, currentTime: seconds }, () => {
			this.player.seek(seconds);
			this.props.onProgress({ currentTime: seconds, isSeeked: true });
		});
	}

	onError(msg) {
		this.props.onError(msg);
		const { error } = this.props;
		this.setState({ renderError: true }, () => {
			let type;
			switch (true) {
				case error === false:
					type = error;
					break;
				case typeof error === "object":
					type = Alert.alert(
						error.title,
						error.message,
						error.button,
						error.options
					);
					break;
				default:
					type = Alert.alert(
						"Oops!",
						"There was an error playing this video, please try again later.",
						[{ text: "Close" }]
					);
					break;
			}
			return type;
		});
	}

	BackHandler() {
		if (this.state.fullScreen) {
			this.setState({ fullScreen: false }, () => {
				this.animToInline()
				this.props.onFullScreen(this.state.fullScreen)
				if (this.props.fullScreenOnly && !this.state.paused) this.togglePlay()
				if (this.props.rotateToFullScreen) Orientation.lockToPortrait()
				// setTimeout(() => {
				//   if (!this.props.lockPortraitOnFsExit) Orientation.unlockAllOrientations()
				// }, 1500)
			})
			return true
		}
		return false;
	}

	changeRate() {
		switch (this.state.rate) {
			case 0.75:
				this.setState({ rate: 1.0 });
				break;
			case 1.0 || 1:
				this.setState({ rate: 1.25 });
				break;
			case 1.25:
				this.setState({ rate: 1.5 });
				break;
			case 1.5:
				this.setState({ rate: 2.0 });
				break;
			case 2.0 || 2:
				this.setState({ rate: 0.75 });
				break;

			default:
				this.setState({ rate: 1.0 });
				break;
		}
	}

	pause() {
		if (!this.state.paused) this.togglePlay();
	}

	play() {
		if (this.state.paused) this.togglePlay();
	}

	togglePlay() {
		this.setState({ paused: !this.state.paused }, () => {
			this.props.onPlay(!this.state.paused);
			// Orientation.getOrientation((e, orientation) => {
			if (this.props.inlineOnly) return;
			if (!this.state.paused) {
				if (this.props.fullScreenOnly && !this.state.fullScreen) {
					this.setState({ fullScreen: true }, () => {
						this.props.onFullScreen(this.state.fullScreen);
						const height = this.props.windowSize.height;
						this.animToFullscreen(height);
						if (this.props.rotateToFullScreen && !Platform.isPad) Orientation.lockToLandscape();
					});
				}
				KeepAwake.activate();
			} else {
				KeepAwake.deactivate();
			}
			// });
		});
	}

	toggleFS() {
		this.setState({ fullScreen: !this.state.fullScreen }, () => {
			Orientation.getOrientation((e, orientation) => {
				if (this.state.fullScreen) {
					const height = this.props.windowSize.height;
					this.props.onFullScreen(this.state.fullScreen);
					if (this.props.rotateToFullScreen && !Platform.isPad) Orientation.lockToLandscape();
					this.animToFullscreen(height);
				} else {
					if (this.props.fullScreenOnly) {
						this.setState({ paused: true }, () =>
							this.props.onPlay(!this.state.paused)
						);
					}
					this.props.onFullScreen(this.state.fullScreen);
					if (orientation === "PORTRAIT" && !Platform.isPad) Orientation.lockToLandscape();
					if (this.props.rotateToFullScreen && !Platform.isPad) Orientation.lockToPortrait()
					this.animToInline();
				}
			});
		});
	}

	animToFullscreen(height) {
		Animated.parallel([
			Animated.timing(this.animFullscreen, { toValue: height, duration: 200 }),
			Animated.timing(this.animInline, { toValue: height, duration: 200 })
		]).start();
	}

	animToInline(height) {
		const newHeight = height || this.state.inlineHeight;
		Animated.parallel([
			Animated.timing(this.animFullscreen, {
				toValue: newHeight,
				duration: 100
			}),
			Animated.timing(this.animInline, {
				toValue: this.state.inlineHeight,
				duration: 100
			})
		]).start();
	}

	toggleMute() {
		this.setState({ muted: !this.state.muted });
	}

	seek(percent) {
		const currentTime = percent * this.state.duration;
		this.setState({ seeking: true, currentTime });
	}

	seekTo(seconds) {
		const percent = seconds / this.state.duration;
		if (seconds > this.state.duration) {
			throw new Error(
				`Current time (${seconds}) exceeded the duration ${this.state.duration}`
			);
			return false;
		}
		return this.onSeekRelease(percent);
	}

	progress(time) {
		const { currentTime, playableDuration } = time;
		const progress = currentTime / this.state.duration;
		if (!this.state.seeking) {
			this.setState(() => {
				if (Platform.OS === "ios") return { progress, currentTime, loading: !this.state.paused && currentTime >= playableDuration };
				return { progress, currentTime };
			}, () => this.props.onProgress(time));
		}
	}

	toggleCaptions = () => {
		if (this.state.textTrackType === textTrackTypes.index) {
			this.setState({ textTrackType: textTrackTypes.disabled });
		} else {
			this.setState({ textTrackType: textTrackTypes.index });
		}
	};

	renderError() {
		const { fullScreen } = this.state;
		const inline = {
			height: this.animInline,
			alignSelf: "stretch"
		};
		const textStyle = { color: "white", padding: 10 };
		return (
			<Animated.View
				style={[styles.background, fullScreen ? styles.fullScreen : inline]}
			>
				<Text style={textStyle}>Retry</Text>
				<Icons
					name="replay"
					size={60}
					color={this.props.theme.scrubberBar}
					onPress={() => this.setState({ renderError: false })}
				/>
			</Animated.View>
		);
	}

	renderPlayer() {
		const {
			fullScreen,
			paused,
			muted,
			loading,
			progress,
			duration,
			inlineHeight,
			currentTime,
			textTrackType,
			hideControls
		} = this.state;

		console.log({hideControls})

		const {
			url,
			loop,
			title,
			logo,
			rate,
			style,
			volume,
			placeholder,
			theme,
			onTimedMetadata,
			resizeMode,
			onMorePress,
			inlineOnly,
			playInBackground,
			playWhenInactive,
			progressUpdateInterval,
			selectedTextTrackIndex,
			textTracks,
			subtitlesStyle,
			captionSource
		} = this.props;

		const inline = {
			//   height: inlineHeight,
			height: "100%",
			alignSelf: "stretch"
		};

		const setTheme = {
			...defaultTheme,
			...theme
		};

		return (
			<Animated.View
				style={[
					styles.background,
					fullScreen
						? (styles.fullScreen, { height: this.animFullscreen })
						: { height: this.animInline },
					fullScreen ? null : style
				]}
			>
				<StatusBar hidden={fullScreen} />
				{((loading && placeholder) || currentTime < 0.01) && (
					<Image
						resizeMode="cover"
						style={styles.image}
						{...checkSource(placeholder)}
					/>
				)}
				{
					this.state.textTrackType !== textTrackTypes.disabled &&
					<Subtitles
						source={captionSource}
						videoDuration={currentTime}
						textStyle={[styles.subtitlesText(fullScreen ), subtitlesStyle.text]}
						styles={[styles.subtitlesContainer(fullScreen, hideControls), subtitlesStyle.container]}
					/>
				}
				<VideoPlayer
					{...checkSource(url)}
					paused={paused}
					resizeMode={resizeMode}
					repeat={loop}
					style={fullScreen ? styles.fullScreen : inline}
					ref={(ref) => { this.player = ref }}
					rate={this.state.rate}
					volume={volume}
					muted={muted}
					playInBackground={playInBackground} // Audio continues to play when app entering background.
					playWhenInactive={playWhenInactive} // [iOS] Video continues to play when control or notification center are shown.
					progressUpdateInterval={progressUpdateInterval}          // [iOS] Interval to fire onProgress (default to ~250ms)
					onLoadStart={() => this.onLoadStart()} // Callback when video starts to load
					onLoad={e => this.onLoad(e)} // Callback when video loads
					onProgress={e => this.progress(e)} // Callback every ~250ms with currentTime
					onEnd={() => this.onEnd()}
					onError={e => this.onError(e)}
					onBuffer={this.onBuffer} // Callback when remote video is buffering
					onTimedMetadata={e => onTimedMetadata(e)} // Callback when the stream receive some metadata
					{... (textTracks)
						?
						{
							selectedTextTrack: {
								type: textTrackType,
								value: selectedTextTrackIndex
							},
							textTracks: textTracks
						}
						: {}
					}
				/>
				<Controls
					ref={ref => {
						this.controls = ref;
					}}
					toggleMute={() => this.toggleMute()}
					toggleFS={() => this.toggleFS()}
					togglePlay={() => this.togglePlay()}
					rewind={pos => this.seekTo(pos)}
					forward={pos => this.seekTo(pos)}
					speed={() => this.changeRate()}
					currentSpeed={this.state.rate}
					paused={paused}
					muted={muted}
					fullscreen={fullScreen}
					loading={loading}
					onSeek={val => this.seek(val)}
					onSeekRelease={pos => this.onSeekRelease(pos)}
					progress={progress}
					currentTime={currentTime}
					duration={duration}
					logo={logo}
					title={title}
					more={!!onMorePress}
					onMorePress={() => onMorePress()}
					theme={setTheme}
					inlineOnly={inlineOnly}
					captions={!!textTracks || !!captionSource}
					toggleCaptions={this.toggleCaptions}
					onControlToggle={hideControls => this.setState({ hideControls })}
				/>
			</Animated.View>
		);
	}

	render() {
		if (this.state.renderError) return this.renderError();
		return this.renderPlayer();
	}
}

Video.propTypes = {
	url: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	placeholder: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
	error: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
	loop: PropTypes.bool,
	autoPlay: PropTypes.bool,
	inlineOnly: PropTypes.bool,
	fullScreenOnly: PropTypes.bool,
	playInBackground: PropTypes.bool,
	playWhenInactive: PropTypes.bool,
	rotateToFullScreen: PropTypes.bool,
	lockPortraitOnFsExit: PropTypes.bool,
	onEnd: PropTypes.func,
	onLoad: PropTypes.func,
	onPlay: PropTypes.func,
	onError: PropTypes.func,
	onProgress: PropTypes.func,
	onMorePress: PropTypes.func,
	onFullScreen: PropTypes.func,
	onTimedMetadata: PropTypes.func,
	rate: PropTypes.number,
	volume: PropTypes.number,
	lockRatio: PropTypes.number,
	logo: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
	title: PropTypes.string,
	theme: PropTypes.object,
	resizeMode: PropTypes.string,
	windowSize: PropTypes.object,
	selectedTextTrackIndex: PropTypes.number,
	textTracks: PropTypes.arrayOf(
		PropTypes.shape({
			title: PropTypes.string,
			uri: PropTypes.string.isRequired,
			type: PropTypes.oneOf([
				TextTrackType.SRT,
				TextTrackType.TTML,
				TextTrackType.VTT,
			]),
			language: PropTypes.string.isRequired
		})
	)
};

Video.defaultProps = {
	placeholder: undefined,
	style: {},
	error: true,
	loop: false,
	autoPlay: false,
	inlineOnly: false,
	fullScreenOnly: false,
	playInBackground: false,
	playWhenInactive: false,
	rotateToFullScreen: false,
	lockPortraitOnFsExit: false,
	onEnd: () => { },
	onLoad: () => { },
	onPlay: () => { },
	onError: () => { },
	onProgress: () => { },
	onMorePress: undefined,
	onFullScreen: () => { },
	onTimedMetadata: () => { },
	rate: 1,
	volume: 1,
	lockRatio: undefined,
	logo: undefined,
	title: "",
	theme: defaultTheme,
	resizeMode: "contain",
	windowSize: {
		width: Dimensions.get("window").width,
		height: Dimensions.get("window").height
	},
	selectedTextTrackIndex: 0,
	captionSource: "",
	subtitlesStyle: {
		container: {},
		text: {}
	}
};

export default Video;
