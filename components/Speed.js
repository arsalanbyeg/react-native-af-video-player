import React from 'react'
import PropTypes from 'prop-types'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'

const backgroundColor = 'transparent'

const styles = StyleSheet.create({
	btnContainer: {
		alignItems: 'center',
		backgroundColor,
		justifyContent: 'center',
		height: "100%"
	}
})

const Speed = (props) => {
	const {
		paddingLeft,
		paddingRight,
		theme,
		size,
		currentSpeed
	} = props

	const padding = {
		paddingLeft: paddingLeft ? 10 : 0,
		paddingRight: paddingRight ? 5 : 0
	}

	return (
		<View style={styles.btnContainer}>
			<TouchableOpacity
				onPress={() => props.onPress()}
			>
				<Text
					style={{
						paddingLeft: padding.paddingLeft,
						paddingRight: padding.paddingRight,
						color: theme,
						fontSize: size
					}}
				>{currentSpeed + "X"}</Text>
			</TouchableOpacity>
		</View>
	)
}

Speed.propTypes = {
	onPress: PropTypes.func,
	currentSpeed: PropTypes.number.isRequired,
	theme: PropTypes.string.isRequired,
	size: PropTypes.number,
	paddingRight: PropTypes.bool,
	paddingLeft: PropTypes.bool
}

Speed.defaultProps = {
	onPress: undefined,
	currentSpeed: 1.0,
	size: 25,
	paddingRight: false,
	paddingLeft: false
}

export { Speed }
