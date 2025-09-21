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
  Audio,
  OffthreadVideo
} from "remotion";
const Layer = ({ layer, sceneColors }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (!layer.timing || !layer.position || !layer.size) return null;
  const startFrame = (layer.timing.start || 0) * fps;
  const endFrame = (layer.timing.end || 3) * fps;
  const opacity = interpolate(frame, [startFrame, startFrame + 15, endFrame - 15, endFrame], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const scale = spring({ fps, frame: frame - startFrame, config: { damping: 200 } });
  const slideInX = interpolate(frame, [startFrame, startFrame + 20], [layer.animation === "slide-in-left" ? -100 : 100, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
  const getAnimationStyles = () => {
    switch (layer.animation) {
      case "slide-in-left":
      case "slide-in-right":
        return { transform: `translateX(${slideInX}%)` };
      case "pop-up":
        return { transform: `scale(${scale})` };
      case "fade-in":
      default:
        return {};
    }
  };
  const layerStyle = {
    position: "absolute",
    left: `${layer.position.x}%`,
    top: `${layer.position.y}%`,
    width: `${layer.size.width}%`,
    height: layer.size.height ? `${layer.size.height}%` : "auto",
    opacity,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...getAnimationStyles()
  };
  switch (layer.type) {
    case "text":
      const primaryColor = sceneColors?.[0] || "#00ffff";
      return /* @__PURE__ */ jsxDEV("div", { style: layerStyle, children: /* @__PURE__ */ jsxDEV("p", { style: {
        fontSize: layer.fontSize || 48,
        color: layer.color || "white",
        textAlign: "center",
        fontWeight: layer.fontWeight || "bold",
        lineHeight: 1.2,
        fontFamily: layer.fontFamily === "monospace" ? "'Roboto Mono', monospace" : "'Poppins', sans-serif",
        textShadow: `0 0 15px ${primaryColor}90`,
        ...layer.style
      }, children: layer.content }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 70,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 69,
        columnNumber: 17
      });
    case "image":
      return /* @__PURE__ */ jsxDEV("div", { style: layerStyle, children: /* @__PURE__ */ jsxDEV(Img, { src: layer.content, style: { width: "100%", height: "100%", objectFit: "contain", ...layer.style } }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 87,
        columnNumber: 21
      }) }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 86,
        columnNumber: 18
      });
    case "shape":
      const bgColor = layer.color || sceneColors?.[1] || "#ff00ff";
      return /* @__PURE__ */ jsxDEV("div", { style: {
        ...layerStyle,
        backgroundColor: bgColor,
        borderRadius: layer.style?.borderRadius || 0
      } }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 93,
        columnNumber: 18
      });
    default:
      return null;
  }
};
const Scene = ({ scene, isFirstScene, creator, projectTitle, recordedVideoUrl }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const {
    concept,
    colors,
    animation = "minimal-fade",
    // Default animation
    text,
    // Legacy, can be used by layers
    style,
    visualConcept,
    imageUrl,
    audioUrl,
    videoUrl,
    videoClip,
    // New clip property
    layers = []
    // New layers array
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
          media: { transform: `scale(${interpolate(frame, [0, durationInFrames], [1.2, 1])})` }
        };
      case "bouncy-pop":
        return {
          media: { transform: `scale(${interpolate(frame, [0, durationInFrames], [1.1, 1])})` }
        };
      case "dramatic-pan":
        return {
          media: { transform: `scale(1.3) translateX(${interpolate(frame, [0, durationInFrames], [-20, 20])}px)` }
        };
      case "energetic-slide":
        return {
          media: { transform: `scale(${interpolate(frame, [0, durationInFrames], [1.1, 1])})` }
        };
      case "minimal-fade":
      default:
        return {
          media: { opacity: interpolate(frame, [0, 20], [0, 1]) }
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
  const backgroundMedia = videoUrl ? /* @__PURE__ */ jsxDEV(
    OffthreadVideo,
    {
      src: videoUrl,
      style: { width: "100%", height: "100%", objectFit: "cover", ...animationStyles.media },
      startFrom: videoClip ? Math.floor(videoClip.start * fps) : 0
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 182,
      columnNumber: 9
    }
  ) : imageUrl ? /* @__PURE__ */ jsxDEV(
    Img,
    {
      src: imageUrl,
      style: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
        ...animationStyles.media
      }
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 188,
      columnNumber: 9
    }
  ) : /* @__PURE__ */ jsxDEV(
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
        padding: 20,
        fontFamily: "'Poppins', sans-serif"
      }, children: visualConcept || "Loading visual..." }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 205,
        columnNumber: 13
      })
    },
    void 0,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 198,
      columnNumber: 10
    }
  );
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { background: getBackground(), opacity: sceneOpacity, fontFamily: "'Poppins', sans-serif" }, children: [
    audioUrl && /* @__PURE__ */ jsxDEV(Audio, { src: audioUrl }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 222,
      columnNumber: 26
    }),
    /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { opacity: 1 }, children: [
      backgroundMedia,
      /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "rgba(0,0,0,0.3)" } }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 227,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 225,
      columnNumber: 13
    }),
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
                  lineNumber: 253,
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
                    lineNumber: 265,
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
                    lineNumber: 275,
                    columnNumber: 29
                  }
                )
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 264,
                columnNumber: 25
              })
            ]
          },
          void 0,
          true,
          {
            fileName: "<stdin>",
            lineNumber: 240,
            columnNumber: 21
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 232,
        columnNumber: 17
      }
    ),
    /* @__PURE__ */ jsxDEV(AbsoluteFill, { children: layers.map((layer, i) => /* @__PURE__ */ jsxDEV(Layer, { layer, sceneColors: colors }, i, false, {
      fileName: "<stdin>",
      lineNumber: 315,
      columnNumber: 21
    })) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 313,
      columnNumber: 13
    }),
    text && layers.length === 0 && /* @__PURE__ */ jsxDEV(
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
              opacity: contentOpacity,
              transform: `scale(${popIn})`
            },
            children: text
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 327,
            columnNumber: 21
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 321,
        columnNumber: 18
      }
    )
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 220,
    columnNumber: 9
  });
};
const AIVideoComposition = ({ scenes, creator, projectTitle, recordedVideoUrl }) => {
  const { fps } = useVideoConfig();
  if (!scenes || scenes.length === 0) {
    return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { background: "#111", justifyContent: "center", alignItems: "center" }, children: /* @__PURE__ */ jsxDEV("h1", { style: { color: "white", fontSize: 48 }, children: "Loading Scene..." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 354,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 353,
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
          projectTitle,
          recordedVideoUrl
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 367,
          columnNumber: 25
        }
      )
    },
    index,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 363,
      columnNumber: 21
    }
  )) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 361,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 360,
    columnNumber: 9
  });
};
export {
  AIVideoComposition
};
