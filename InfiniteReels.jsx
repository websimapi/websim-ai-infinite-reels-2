import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Player } from "@websim/remotion/player";
import { AIVideoComposition } from "./composition.jsx";
import { generateVideoContent } from "./VideoGenerator.js";
const InfiniteReels = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("AI is creating your next reel...");
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const generationLock = useRef(false);
  const timeoutRef = useRef(null);
  const updateStatus = (message) => {
    console.log(`[Status] ${message}`);
    setLoadingStatus(message);
  };
  const generateNewReel = useCallback(async () => {
    if (generationLock.current) {
      console.log("[InfiniteReels] Generation already in progress. Skipping.");
      return;
    }
    console.log("[InfiniteReels] Starting new reel generation...");
    generationLock.current = true;
    setLoading(true);
    updateStatus("Initializing AI...");
    timeoutRef.current = setTimeout(() => {
      console.error("[InfiniteReels] Generation timed out after 90 seconds.");
      setLoading(false);
      generationLock.current = false;
    }, 9e4);
    try {
      const content = await generateVideoContent(updateStatus);
      if (!content) {
        throw new Error("Content generation returned null or undefined.");
      }
      console.log("[InfiniteReels] Content generated:", content);
      const newReel = {
        id: Date.now() + Math.random(),
        ...content,
        timestamp: Date.now()
      };
      console.log("[InfiniteReels] Adding new reel to state:", newReel);
      setReels((prev) => {
        const updatedReels = [...prev, newReel];
        console.log("[InfiniteReels] Reels state updated. New count:", updatedReels.length);
        return updatedReels;
      });
    } catch (error) {
      console.error("[InfiniteReels] Error generating reel:", error);
      updateStatus("Failed to generate reel. Please wait for the next one.");
    } finally {
      clearTimeout(timeoutRef.current);
      console.log("[InfiniteReels] Finished reel generation process.");
      setLoading(false);
      generationLock.current = false;
    }
  }, []);
  const loadInitialReels = useCallback(async () => {
    if (reels.length > 0) return;
    console.log("[InfiniteReels] Loading initial reels...");
    setLoading(true);
    updateStatus("Warming up the AI...");
    generationLock.current = true;
    try {
      const content1 = await generateVideoContent(updateStatus);
      const content2 = await generateVideoContent(updateStatus);
      const initialReelsContent = [content1, content2];
      console.log("[InfiniteReels] Initial content generated:", initialReelsContent);
      setReels(initialReelsContent.map((content, index) => ({
        id: Date.now() + index,
        ...content,
        timestamp: Date.now() + index
      })));
      console.log("[InfiniteReels] Initial reels loaded.");
    } catch (error) {
      console.error("[InfiniteReels] Error loading initial reels:", error);
    } finally {
      setLoading(false);
      generationLock.current = false;
    }
  }, [reels.length]);
  useEffect(() => {
    loadInitialReels();
  }, [loadInitialReels]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            setCurrentIndex(index);
            if (index >= reels.length - 2) {
              generateNewReel();
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5
      }
    );
    observerRef.current = observer;
    const reelItems = container.querySelectorAll(".reel-item");
    reelItems.forEach((item) => observer.observe(item));
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [reels, generateNewReel]);
  const ReelItem = ({ reel, index, isActive }) => {
    const [videoProgress, setVideoProgress] = useState(0);
    const [playerError, setPlayerError] = useState(null);
    console.log("Rendering reel:", reel, "isActive:", isActive);
    return /* @__PURE__ */ jsxDEV(
      "div",
      {
        className: `reel-item ${isActive ? "slide-up" : ""}`,
        "data-index": index,
        children: /* @__PURE__ */ jsxDEV("div", { className: "reel-content", children: [
          /* @__PURE__ */ jsxDEV("div", { className: "video-player", children: playerError ? /* @__PURE__ */ jsxDEV("div", { style: {
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#222",
            color: "#fff",
            flexDirection: "column"
          }, children: [
            /* @__PURE__ */ jsxDEV("div", { children: [
              "Video Error: ",
              playerError
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 163,
              columnNumber: 33
            }),
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: "12px", marginTop: "10px" }, children: [
              "Reel data: ",
              JSON.stringify(reel, null, 2)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 164,
              columnNumber: 33
            })
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 153,
            columnNumber: 29
          }) : /* @__PURE__ */ jsxDEV(
            Player,
            {
              component: AIVideoComposition,
              durationInFrames: reel.durationInFrames || 180,
              fps: 30,
              compositionWidth: 540,
              compositionHeight: 960,
              loop: true,
              autoplay: isActive,
              controls: true,
              inputProps: reel.inputProps || {},
              style: {
                width: "100%",
                height: "100%",
                borderRadius: "16px"
              },
              onTimeUpdate: (time) => {
                const progress = time / (reel.durationInFrames || 180) * 100;
                setVideoProgress(progress);
              },
              onError: (error) => {
                console.error("Player error:", error);
                setPlayerError(error.message || "Unknown player error");
              }
            },
            void 0,
            false,
            {
              fileName: "<stdin>",
              lineNumber: 169,
              columnNumber: 29
            }
          ) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 151,
            columnNumber: 21
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "reel-overlay" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 196,
            columnNumber: 21
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "progress-bar", style: { width: `${videoProgress}%` } }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 198,
            columnNumber: 21
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "reel-metadata", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "reel-title", children: reel.title }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 201,
              columnNumber: 25
            }),
            /* @__PURE__ */ jsxDEV("div", { className: "reel-description", children: reel.description }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 202,
              columnNumber: 25
            }),
            reel.inputProps?.creator && /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, opacity: 0.95 }, children: [
              /* @__PURE__ */ jsxDEV("img", { src: reel.inputProps.creator.avatar_url || `https://images.websim.com/avatar/${reel.inputProps.creator.username}`, alt: reel.inputProps.creator.username, style: { width: 24, height: 24, borderRadius: "50%" } }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 206,
                columnNumber: 33
              }),
              /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 12, opacity: 0.9 }, children: [
                "by @",
                reel.inputProps.creator.username
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 207,
                columnNumber: 33
              })
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 205,
              columnNumber: 29
            }),
            /* @__PURE__ */ jsxDEV("div", { className: "reel-tags", children: reel.tags.map((tag, i) => /* @__PURE__ */ jsxDEV("span", { className: "tag", children: [
              "#",
              tag
            ] }, i, true, {
              fileName: "<stdin>",
              lineNumber: 212,
              columnNumber: 33
            })) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 210,
              columnNumber: 25
            })
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 200,
            columnNumber: 21
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "controls-overlay", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "control-btn", title: "Like", children: "\u2764\uFE0F" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 218,
              columnNumber: 25
            }),
            /* @__PURE__ */ jsxDEV("div", { className: "control-btn", title: "Share", children: "\u{1F4E4}" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 219,
              columnNumber: 25
            }),
            /* @__PURE__ */ jsxDEV("div", { className: "control-btn", title: "Save", children: "\u{1F516}" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 220,
              columnNumber: 25
            })
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 217,
            columnNumber: 21
          })
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 150,
          columnNumber: 17
        })
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 146,
        columnNumber: 13
      }
    );
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "reels-container", ref: containerRef, children: [
    reels.map((reel, index) => /* @__PURE__ */ jsxDEV(
      ReelItem,
      {
        reel,
        index,
        isActive: index === currentIndex
      },
      reel.id,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 230,
        columnNumber: 17
      }
    )),
    loading && /* @__PURE__ */ jsxDEV("div", { className: "reel-item", children: /* @__PURE__ */ jsxDEV("div", { className: "reel-content loading-reel", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "loading-spinner" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 241,
        columnNumber: 25
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "loading-text", children: loadingStatus }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 242,
        columnNumber: 25
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 240,
      columnNumber: 21
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 239,
      columnNumber: 17
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 228,
    columnNumber: 9
  });
};
var stdin_default = InfiniteReels;
export {
  stdin_default as default
};
