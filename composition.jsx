import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring
} from "remotion";
const AIVideoComposition = ({ concept, colors, animation, text, style, creator, projectTitle, projectDescription }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  console.log("Composition props:", { concept, colors, animation, text, style, creator, projectTitle });
  const opacity = interpolate(frame, [0, 30], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const scale = spring({
    fps,
    frame,
    config: { damping: animation === "bouncy" ? 100 : 200 }
  });
  const primaryColor = colors && colors[0] || "#00ffff";
  const secondaryColor = colors && colors[1] || "#ff00ff";
  const accentColor = colors && colors[2] || "#ffffff";
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
        lineNumber: 54,
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
  const creatorOpacity = interpolate(frame, [30, 60], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const creatorScale = spring({
    fps,
    frame: Math.max(0, frame - 30),
    config: { damping: 200 }
  });
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { background: getBackground() }, children: [
    /* @__PURE__ */ jsxDEV("div", { style: {
      position: "absolute",
      top: "10px",
      left: "10px",
      fontSize: "12px",
      color: "white",
      background: "rgba(0,0,0,0.7)",
      padding: "5px",
      borderRadius: "4px",
      zIndex: 100
    }, children: [
      "Frame: ",
      frame,
      " / ",
      durationInFrames
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 94,
      columnNumber: 13
    }),
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
        lineNumber: 111,
        columnNumber: 21
      }
    )) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 109,
      columnNumber: 13
    }),
    creator && /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: 20,
          opacity: creatorOpacity,
          transform: `scale(${creatorScale})`
        },
        children: /* @__PURE__ */ jsxDEV(
          "div",
          {
            style: {
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(10px)",
              padding: 12,
              borderRadius: 20,
              border: `1px solid ${primaryColor}40`,
              boxShadow: `0 0 20px ${primaryColor}30`
            },
            children: [
              /* @__PURE__ */ jsxDEV(
                "img",
                {
                  src: creator.avatar_url || `https://images.websim.com/avatar/${creator.username}`,
                  alt: creator.username,
                  style: {
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: `2px solid ${primaryColor}`,
                    boxShadow: `0 0 15px ${primaryColor}50`
                  }
                },
                void 0,
                false,
                {
                  fileName: "<stdin>",
                  lineNumber: 145,
                  columnNumber: 25
                }
              ),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV(
                  "div",
                  {
                    style: {
                      fontSize: 14,
                      fontWeight: "bold",
                      color: primaryColor,
                      marginBottom: 2
                    },
                    children: [
                      "@",
                      creator.username
                    ]
                  },
                  void 0,
                  true,
                  {
                    fileName: "<stdin>",
                    lineNumber: 157,
                    columnNumber: 29
                  }
                ),
                /* @__PURE__ */ jsxDEV(
                  "div",
                  {
                    style: {
                      fontSize: 10,
                      color: accentColor,
                      opacity: 0.8
                    },
                    children: "Original Creator"
                  },
                  void 0,
                  false,
                  {
                    fileName: "<stdin>",
                    lineNumber: 167,
                    columnNumber: 29
                  }
                )
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 156,
                columnNumber: 25
              })
            ]
          },
          void 0,
          true,
          {
            fileName: "<stdin>",
            lineNumber: 132,
            columnNumber: 21
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 123,
        columnNumber: 17
      }
    ),
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
                lineNumber: 204,
                columnNumber: 21
              }
            )
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 190,
            columnNumber: 17
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 182,
        columnNumber: 13
      }
    ),
    /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          justifyContent: "center",
          alignItems: "center",
          paddingBottom: 120
        },
        children: /* @__PURE__ */ jsxDEV(
          "h1",
          {
            style: {
              fontSize: 48,
              fontWeight: "bold",
              color: accentColor,
              textAlign: "center",
              textShadow: `0 0 20px ${primaryColor}`
            },
            children: text || concept || "AI Reels"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 224,
            columnNumber: 17
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 217,
        columnNumber: 13
      }
    ),
    /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          justifyContent: "flex-end",
          alignItems: "center",
          paddingBottom: 40,
          paddingLeft: 20,
          paddingRight: 20
        },
        children: /* @__PURE__ */ jsxDEV(
          "div",
          {
            style: {
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              padding: 16,
              borderRadius: 12,
              border: `1px solid ${primaryColor}40`,
              maxWidth: "80%",
              textAlign: "center"
            },
            children: [
              /* @__PURE__ */ jsxDEV(
                "h2",
                {
                  style: {
                    fontSize: 24,
                    fontWeight: "bold",
                    color: primaryColor,
                    marginBottom: 8,
                    textShadow: `0 0 20px ${primaryColor}`
                  },
                  children: projectTitle || text || concept || "AI Reels"
                },
                void 0,
                false,
                {
                  fileName: "<stdin>",
                  lineNumber: 258,
                  columnNumber: 21
                }
              ),
              projectDescription && /* @__PURE__ */ jsxDEV(
                "p",
                {
                  style: {
                    fontSize: 14,
                    color: accentColor,
                    opacity: 0.9,
                    lineHeight: 1.4
                  },
                  children: projectDescription
                },
                void 0,
                false,
                {
                  fileName: "<stdin>",
                  lineNumber: 270,
                  columnNumber: 25
                }
              )
            ]
          },
          void 0,
          true,
          {
            fileName: "<stdin>",
            lineNumber: 247,
            columnNumber: 17
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 238,
        columnNumber: 13
      }
    )
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 92,
    columnNumber: 9
  });
};
export {
  AIVideoComposition
};
