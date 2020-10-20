import React, { useEffect, useState } from "react"
import { Text, View, StyleSheet } from "react-native";
import parser from "subtitles-parser";
import { parseVtt } from "./utils";
import fs from "react-native-fs";

const style = StyleSheet.create({
	container: {
		width: "100%"
	},
	text: {
		fontSize: 15,
		color: "white",
		maxWidth: "80%",
		alignSelf: "center",
		paddingHorizontal: 10,
		backgroundColor: "black",
	},
});

const Subtitles = ({ videoDuration, textStyle, source, styles }) => {
	const [data, setData] = useState([]);

	useEffect(() => {
		getData();
	}, []);


	const getData = async () => {
		if (!source) return;

		try {
			const isSrt = source.slice(source.lastIndexOf(".") + 1) === "srt";

			var file = await fs.readFile(source);
			var parsedData = isSrt ? parser.fromSrt(file, true) : parseVtt(file, "ms");
			setData(parsedData);
		} catch (error_subtitles) {
			console.log(({ error_subtitles }))
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
			style={[style.container, styles]}
			children={<Text style={[style.text, textStyle]} children={getSubtitle()} />}
		/>;
}

export { Subtitles };
