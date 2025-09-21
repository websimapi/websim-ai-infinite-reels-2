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
  Img
} from "remotion";
const Scene = ({ scene, isFirstScene, creator, projectTitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const {
    concept,
    colors,
    animation,
    text,
    style,
    visualConcept,
    imageUrl
  } = scene;
  const contentOpacity = spring({
    fps,
    frame,
    config: { damping: 200 }
  });
  const scale = spring({
    fps,
    frame,
    config: { damping: animation === "bouncy" ? 100 : 200 }
  });
  const sceneOpacity = interpolate(frame, [0, 15, durationInFrames - 15, durationInFrames], [0, 1, 1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp"
  });
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
    imageUrl ? /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { opacity: contentOpacity }, children: [
      /* @__PURE__ */ jsxDEV(
        Img,
        {
          src: imageUrl,
          style: {
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${interpolate(frame, [0, durationInFrames], [1.1, 1])})`
          }
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 70,
          columnNumber: 21
        }
      ),
      /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "rgba(0,0,0,0.3)" } }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 79,
        columnNumber: 21
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 69,
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
          lineNumber: 89,
          columnNumber: 21
        })
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 82,
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
                  lineNumber: 125,
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
                    lineNumber: 137,
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
                    lineNumber: 147,
                    columnNumber: 29
                  }
                )
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 136,
                columnNumber: 25
              })
            ]
          },
          void 0,
          true,
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
        lineNumber: 104,
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
              lineHeight: 1.2
            },
            children: text
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 192,
            columnNumber: 21
          }
        )
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 186,
        columnNumber: 18
      }
    )
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 66,
    columnNumber: 9
  });
};
const AIVideoComposition = ({ scenes, creator, projectTitle }) => {
  const { fps } = useVideoConfig();
  if (!scenes || scenes.length === 0) {
    return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { background: "#111", justifyContent: "center", alignItems: "center" }, children: /* @__PURE__ */ jsxDEV("h1", { style: { color: "white", fontSize: 48 }, children: "Loading Scene..." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 217,
      columnNumber: 17
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 216,
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
          lineNumber: 230,
          columnNumber: 25
        }
      )
    },
    index,
    false,
    {
      fileName: "<stdin>",
      lineNumber: 226,
      columnNumber: 21
    }
  )) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 224,
    columnNumber: 13
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 223,
    columnNumber: 9
  });
};
export {
  AIVideoComposition
};
