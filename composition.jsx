import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring
} from "remotion";
const AIVideoComposition = ({ concept, colors, animation, text, style }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const opacity = interpolate(frame, [0, 30], [0, 1]);
  const scale = spring({
    fps,
    frame,
    config: { damping: animation === "bouncy" ? 100 : 200 }
  });
  const primaryColor = colors?.[0] || "#00ffff";
  const secondaryColor = colors?.[1] || "#ff00ff";
  const accentColor = colors?.[2] || "#ffffff";
  const getBackground = () => {
    switch (style) {
      case "cyberpunk":
        return `linear-gradient(45deg, #0a0a0a 0%, #1a0a2e 50%, ${primaryColor}20 100%)`;
      case "minimal":
        return `linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)`;
      case "retro":
        return `linear-gradient(45deg, #2d1b69 0%, #11998e 100%)`;
      default:
        return `linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)`;
    }
  };
  const Particle = ({ delay, x, y, size }) => {
    const particleFrame = Math.max(0, frame - delay);
    const particleOpacity = interpolate(particleFrame, [0, 30, durationInFrames - 30, durationInFrames], [0, 1, 1, 0]);
    const floatY = interpolate(particleFrame, [0, durationInFrames], [y, y - 100]);
    return /* @__PURE__ */ jsxDEV(
      "div",
      {
        style: {
          position: "absolute",
          left: `${x}%`,
          top: `${floatY}%`,
          width: size,
          height: size,
          borderRadius: "50%",
          background: primaryColor,
          opacity: particleOpacity,
          boxShadow: `0 0 20px ${primaryColor}`,
          animation: animation === "bouncy" ? "bounce 2s infinite" : "none"
        }
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 48,
        columnNumber: 13
      }
    );
  };
  const textY = interpolate(frame, [60, 90], [100, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const textScale = spring({
    fps,
    frame: Math.max(0, frame - 60),
    config: { damping: 200 }
  });
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { background: getBackground() }, children: [
    /* @__PURE__ */ jsxDEV(AbsoluteFill, { children: Array.from({ length: 15 }).map((_, i) => /* @__PURE__ */ jsxDEV(
      Particle,
      {
        delay: i * 5,
        x: Math.random() * 100,
        y: 80 + Math.random() * 20,
        size: Math.random() * 8 + 4
      },
      i,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 78,
        columnNumber: 21
      }
    )) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 76,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          justifyContent: "center",
          alignItems: "center",
          opacity,
          transform: `scale(${scale})`
        },
        children: /* @__PURE__ */ jsxDEV(
          "div",
          {
            style: {
              width: 200,
              height: 200,
              border: `3px solid ${primaryColor}`,
              borderRadius: style === "minimal" ? "8px" : "50%",
              background: `linear-gradient(45deg, ${primaryColor}20, ${secondaryColor}20)`,
              boxShadow: `0 0 50px ${primaryColor}80`,
              transform: `rotate(${frame * 2}deg)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            },
            children: /* @__PURE__ */ jsxDEV(
              "div",
              {
                style: {
                  width: 100,
                  height: 100,
                  background: secondaryColor,
                  borderRadius: style === "minimal" ? "4px" : "50%",
                  transform: `rotate(${-frame * 3}deg)`
                }
              },
              void 0,
              false,
              {
                fileName: "<stdin>",
                lineNumber: 112,
                columnNumber: 21
              }
            )
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 98,
            columnNumber: 17
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 89,
        columnNumber: 13
      }
    ),
    /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 120,
          transform: `translateY(${textY}px) scale(${textScale})`
        },
        children: /* @__PURE__ */ jsxDEV(
          "h1",
          {
            style: {
              fontSize: 48,
              fontWeight: "bold",
              color: accentColor,
              textAlign: "center",
              textShadow: `0 0 20px ${primaryColor}`,
              background: `linear-gradient(45deg, ${primaryColor}, ${secondaryColor})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            },
            children: text || "AI Reels"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 133,
            columnNumber: 17
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 125,
        columnNumber: 13
      }
    ),
    concept && /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 60,
          opacity: interpolate(frame, [120, 150], [0, 1])
        },
        children: /* @__PURE__ */ jsxDEV(
          "p",
          {
            style: {
              fontSize: 16,
              color: accentColor,
              textAlign: "center",
              opacity: 0.8,
              maxWidth: 300,
              lineHeight: 1.4
            },
            children: concept
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 160,
            columnNumber: 21
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 152,
        columnNumber: 17
      }
    )
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 74,
    columnNumber: 9
  });
};
export {
  AIVideoComposition
};
