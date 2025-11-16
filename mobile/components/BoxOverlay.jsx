import React from "react";
import { View, StyleSheet } from "react-native";

export default function BoxOverlay({ predictions, imageWidth, imageHeight }) {
  if (!predictions || predictions.length === 0) return null;

  return (
    <View style={[StyleSheet.absoluteFill, { position: "absolute" }]}>
      {predictions.map((pred, idx) => {
        const [x1, y1, x2, y2] = pred.box;
        const left = (x1 / 512) * imageWidth;
        const top = (y1 / 512) * imageHeight;
        const width = ((x2 - x1) / 512) * imageWidth;
        const height = ((y2 - y1) / 512) * imageHeight;

        return (
          <View
            key={idx}
            style={{
              position: "absolute",
              left,
              top,
              width,
              height,
              borderWidth: 2,
              borderColor: "red",
            }}
          />
        );
      })}
    </View>
  );
}
