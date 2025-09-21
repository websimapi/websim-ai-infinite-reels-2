import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  spring,
  Series,
  Sequence,
  Img,
  Audio
} from "remotion";
const Scene = ({ scene, isFirstScene, creator, projectTitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const {
    concept,
    colors,
    animation = "minimal-fade",
    // Default animation
    text,
    style,
    visualConcept,
    imageUrl,
    audioUrl
  } = scene;
  const contentOpacity = spring({ fps, frame: frame - 5, config: { damping: 200 } });
  const popIn = spring({ fps, frame: frame - 10, config: { damping: 100, stiffness: 200 } });
  const sceneOpacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const getAnimationStyles = () => {
    switch (animation) {
      case "smooth-zoom":
        return {
          image: { transform: `scale(${interpolate(frame, [0, durationInFrames], [1.2, 1])})` },
          text: { transform: `scale(${popIn})`, opacity: contentOpacity }
        };
      case "bouncy-pop":
        return {
          image: { transform: `scale(${interpolate(frame, [0, durationInFrames], [1.1, 1])})` },
          text: { transform: `scale(${popIn})`, opacity: contentOpacity }
        };
      case "dramatic-pan":
        return {
          image: { transform: `scale(1.3) translateX(${interpolate(frame, [0, durationInFrames], [-20, 20])}px)` },
          text: { transform: `scale(${popIn})`, opacity: contentOpacity }
        };
      case "energetic-slide":
        return {
          image: { transform: `scale(${interpolate(frame, [0, durationInFrames], [1.1, 1])})` },
          text: {
            transform: `translateY(${interpolate(frame, [10, 30], [50, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })
          }
        };
      case "minimal-fade":
      default:
        return {
          image: { opacity: interpolate(frame, [0, 20], [0, 1]) },
          text: { opacity: interpolate(frame, [10, 30], [0, 1]) }
        };
    }
  };
  const animationStyles = getAnimationStyles();
  const primaryColor = colors && colors[0] ? colors[0] : "#00ffff";
  const secondaryColor = colors && colors[1] ? colors[1] : "#ff00ff";
  const accentColor = colors && colors[2] ? colors[2] : "#ffffff";
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
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { background: getBackground(), opacity: sceneOpacity }, children: [
    audioUrl && /* @__PURE__ */ jsxDEV(Audio, { src: audioUrl }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 98,
      columnNumber: 26
    }),
    imageUrl ? /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { opacity: 1 }, children: [
      /* @__PURE__ */ jsxDEV(
        Img,
        {
          src: imageUrl,
          style: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...animationStyles.image
          }
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 103,
          columnNumber: 21
        }
      ),
      /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "rgba(0,0,0,0.3)" } }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 112,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 102,
      columnNumber: 17
    }) : /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          justifyContent: "center",
          alignItems: "center",
          opacity: contentOpacity
        },
        children: /* @__PURE__ */ jsxDEV("div", { style: {
          fontSize: 24,
          color: accentColor,
          textAlign: "center",
          maxWidth: "80%",
          opacity: 0.8,
          padding: 20
        }, children: visualConcept || "Loading visual..." }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 122,
          columnNumber: 21
        })
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 115,
        columnNumber: 18
      }
    ),
    isFirstScene && creator && /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          justifyContent: "flex-start",
          alignItems: "flex-start",
          padding: 40,
          opacity: contentOpacity
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
                    width: 50,
                    height: 50,
                    borderRadius: "50%",
                    border: `2px solid ${primaryColor}`,
                    boxShadow: `0 0 15px ${primaryColor}50`
                  }
                },
                void 0,
                false,
                {
                  fileName: "<stdin>",
                  lineNumber: 158,
                  columnNumber: 25
                }
              ),
              /* @__PURE__ */ jsxDEV("div", { children: [
                /* @__PURE__ */ jsxDEV(
                  "div",
                  {
                    style: {
                      fontSize: 20,
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
                    lineNumber: 170,
                    columnNumber: 29
                  }
                ),
                /* @__PURE__ */ jsxDEV(
                  "div",
                  {
                    style: {
                      fontSize: 16,
                      color: accentColor,
                      opacity: 0.8
                    },
                    children: "Original Creator"
                  },
                  void 0,
                  false,
                  {
                    fileName: "<stdin>",
                    lineNumber: 180,
                    columnNumber: 29
                  }
                )
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 169,
                columnNumber: 25
              })
            ]
          },
          void 0,
          true,
          {
            fileName: "<stdin>",
            lineNumber: 145,
            columnNumber: 21
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 137,
        columnNumber: 17
      }
    ),
    text && /* @__PURE__ */ jsxDEV(
      AbsoluteFill,
      {
        style: {
          justifyContent: "center",
          alignItems: "center"
        },
        children: /* @__PURE__ */ jsxDEV(
          "h1",
          {
            style: {
              fontSize: 72,
              fontWeight: "bold",
              color: accentColor,
              textAlign: "center",
              textShadow: `0 0 30px ${primaryColor}`,
              maxWidth: "90%",
              lineHeight: 1.2,
              ...animationStyles.text
            },
            children: text
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 225,
            columnNumber: 21
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 219,
        columnNumber: 18
      }
    )
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 96,
    columnNumber: 9
  });
};
const AIVideoComposition = ({ scenes, creator, projectTitle }) => {
  const { fps } = useVideoConfig();
  if (!scenes || scenes.length === 0) {
    return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { background: "#111", justifyContent: "center", alignItems: "center" }, children: /* @__PURE__ */ jsxDEV("h1", { style: { color: "white", fontSize: 48 }, children: "Loading Scene..." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 251,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 250,
      columnNumber: 13
    });
  }
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { children: /* @__PURE__ */ jsxDEV(Series, { children: scenes.map((scene, index) => /* @__PURE__ */ jsxDEV(
    Series.Sequence,
    {
      durationInFrames: Math.floor((scene.durationInSeconds || 3) * fps),
      children: /* @__PURE__ */ jsxDEV(
        Scene,
        {
          scene,
          isFirstScene: index === 0,
          creator,
          projectTitle
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 264,
          columnNumber: 25
        }
      )
    },
    index,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 260,
      columnNumber: 21
    }
  )) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 258,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 257,
    columnNumber: 9
  });
};
export {
  AIVideoComposition
};
