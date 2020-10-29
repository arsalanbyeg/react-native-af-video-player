import React, { useEffect, useState } from "react"
import { Text, View, StyleSheet } from "react-native";
import { parserVtt, isValidURL } from "./utils";
import parserSRT from "subtitles-parser";
import fs from "react-native-fs";
import Axios from "axios";

const style = StyleSheet.create({
	container: disable => ({
		width: "100%",
		opacity: disable ? 0 : 1
	}),
	text: {
		fontSize: 15,
		color: "white",
		maxWidth: "80%",
		alignSelf: "center",
		paddingHorizontal: 10,
		backgroundColor: "black",
	},
});

const Subtitles = ({ videoDuration, textStyle, source, disable, styles, onError = () => { } }) => {
	const [file, setFile] = useState("");
	const [data, setData] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setFileData();
	}, [source]);

	useEffect(() => {
		getData();
	}, [file]);

	const setFileData = async () => {
		setLoading(true);
		try {
			if (isValidURL(source)) {
				const { data } = await Axios.get(source);
				setFile(data);
			} else {
				var file = await fs.readFile(source);
				setFile(file)
			}
		} catch (error_setFileData) {
			setFile("");
			onError({error_setFileData})
		} finally {
			setLoading(false);
		}
	};

	const getData = async () => {
		if (!source) return;
		try {
			const isSrt = source.slice(source.lastIndexOf(".") + 1) === "srt";
			var parsedData = isSrt ? parserSRT.fromSrt(file, true) : parserVtt(file, "ms");
			setData(parsedData);

		} catch (error_subtitles) {
			onError({error_subtitles})
		}
	};

	const getSubtitle = () => {
		var subtitle = "";
		data.map(({ startTime, endTime, text }) => {
			if (videoDuration >= startTime / 1000 && videoDuration <= endTime / 1000) {
				subtitle = text;
			}
		})
		return subtitle;
	};

	return !source || !getSubtitle() ?
		<View /> :
		<View
			style={[style.container(disable), styles]}
			children={<Text style={[style.text, textStyle]} children={loading ? "Loading..." : getSubtitle()} />}
		/>;
}

export { Subtitles };
