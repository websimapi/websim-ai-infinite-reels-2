import { jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Player } from "@websim/remotion/player";
import { AIVideoComposition } from "./composition.jsx";
import { generateVideoContent, fetchWebsimProjectData } from "./VideoGenerator.js";
const Settings = ({ onStart }) => {
  const [scenes, setScenes] = useState(3);
  const [initialReels, setInitialReels] = useState(2);
  const [infiniteScroll, setInfiniteScroll] = useState("auto");
  const handleSubmit = (e) => {
    e.preventDefault();
    onStart({ scenes, initialReels, infiniteScroll });
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "settings-container", children: [
    /* @__PURE__ */ jsxDEV("h1", { className: "reel-title", style: { fontSize: "32px", marginBottom: "10px" }, children: "Configure Your Reels" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 18,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("p", { className: "reel-description", style: { maxWidth: "400px", marginBottom: "20px" }, children: "Customize your AI-generated reel experience." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 19,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("form", { onSubmit: handleSubmit, className: "settings-form", children: [
      /* @__PURE__ */ jsxDEV("label", { htmlFor: "scenes-input", className: "settings-label", children: "Scenes per Reel:" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 23,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          id: "scenes-input",
          type: "number",
          value: scenes,
          onChange: (e) => setScenes(Math.max(1, Math.min(5, parseInt(e.target.value, 10) || 1))),
          min: "1",
          max: "5",
          className: "settings-input"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 24,
          columnNumber: 17
        }
      ),
      /* @__PURE__ */ jsxDEV("label", { htmlFor: "initial-reels-input", className: "settings-label", children: "Reels to generate initially:" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 34,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV(
        "input",
        {
          id: "initial-reels-input",
          type: "number",
          value: initialReels,
          onChange: (e) => setInitialReels(Math.max(1, Math.min(5, parseInt(e.target.value, 10) || 1))),
          min: "1",
          max: "5",
          className: "settings-input"
        },
        void 0,
        false,
        {
          fileName: "<stdin>",
          lineNumber: 35,
          columnNumber: 18
        }
      ),
      /* @__PURE__ */ jsxDEV("label", { className: "settings-label", children: "Infinite Scroll:" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 45,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "toggle-button-group", children: [
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            onClick: () => setInfiniteScroll("auto"),
            className: `toggle-button ${infiniteScroll === "auto" ? "active" : ""}`,
            children: "Automatic"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 47,
            columnNumber: 21
          }
        ),
        /* @__PURE__ */ jsxDEV(
          "button",
          {
            type: "button",
            onClick: () => setInfiniteScroll("manual"),
            className: `toggle-button ${infiniteScroll === "manual" ? "active" : ""}`,
            children: "Manual"
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 52,
            columnNumber: 21
          }
        )
      ] }, void 0, true, {
        fileName: "<stdin>",
        lineNumber: 46,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("button", { type: "submit", className: "start-button", style: { marginTop: "20px" }, children: "Start Generating" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 59,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 22,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 17,
    columnNumber: 9
  });
};
const InteractionScreen = ({ onRecordingComplete, projectUrl }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [status, setStatus] = useState("Ready to record");
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const startRecording = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
      setStatus("Screen recording is not supported in your browser.");
      return;
    }
    try {
      setStatus("Waiting for screen share permission...");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "tab" },
        audio: false
      });
      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          stopRecording();
        }
      };
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: "video/webm" });
      recordedChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      mediaRecorderRef.current.onstop = async () => {
        setStatus("Processing recording...");
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const file = new File([blob], "recording.webm", { type: "video/webm" });
        try {
          const url = await websim.upload(file);
          setStatus("Recording uploaded!");
          onRecordingComplete(url);
        } catch (error) {
          console.error("Upload failed:", error);
          setStatus("Error uploading recording. Please try again.");
        }
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatus("Recording... Interact with the page below.");
    } catch (err) {
      console.error("Error starting recording:", err);
      setStatus("Could not start recording. Please grant permission and select this tab.");
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("Stopping recording...");
    }
  };
  return /* @__PURE__ */ jsxDEV("div", { className: "interaction-container", children: [
    /* @__PURE__ */ jsxDEV("h1", { className: "reel-title", style: { fontSize: "32px", marginBottom: "10px" }, children: "Record Your Interaction" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 134,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("p", { className: "reel-description", style: { maxWidth: "600px", marginBottom: "20px" }, children: "Click 'Start Recording', choose this browser tab, then interact with the project below. Click 'Stop' when you're done to generate reels based on your actions." }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 135,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "recording-controls", children: [
      /* @__PURE__ */ jsxDEV("button", { onClick: startRecording, disabled: isRecording, className: "start-button", children: "Start Recording" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 139,
        columnNumber: 17
      }),
      /* @__PURE__ */ jsxDEV("button", { onClick: stopRecording, disabled: !isRecording, className: "start-button", style: { background: "linear-gradient(45deg, #ff6b6b, #f06595)" }, children: "Stop & Generate" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 142,
        columnNumber: 17
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 138,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("p", { className: "status-text", children: [
      "Status: ",
      status
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 146,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "iframe-wrapper", children: projectUrl ? /* @__PURE__ */ jsxDEV("iframe", { src: projectUrl, title: "Project Interaction", sandbox: "allow-scripts allow-same-origin allow-popups allow-forms" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 149,
      columnNumber: 21
    }) : /* @__PURE__ */ jsxDEV("div", { className: "loading-spinner" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 151,
      columnNumber: 21
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 147,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 133,
    columnNumber: 9
  });
};
const InfiniteReels = () => {
  const [appState, setAppState] = useState("settings");
  const [settings, setSettings] = useState({
    scenesPerReel: 3,
    initialReels: 2,
    infiniteScrollMode: "auto"
  });
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [projectUrl, setProjectUrl] = useState(null);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("AI is creating your next reel...");
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const generationLock = useRef(false);
  const timeoutRef = useRef(null);
  const handleStart = async (newSettings) => {
    setSettings({
      scenesPerReel: newSettings.scenes,
      initialReels: newSettings.initialReels,
      infiniteScrollMode: newSettings.infiniteScroll
    });
    try {
      setLoadingStatus("Fetching project to interact with...");
      setAppState("interaction");
      const projectData = await fetchWebsimProjectData();
      if (projectData && projectData.pageUrl) {
        setProjectUrl(projectData.pageUrl);
      } else {
        console.error("Could not fetch a project URL for interaction.");
        setProjectUrl(null);
      }
    } catch (error) {
      console.error("Failed to fetch project data for interaction:", error);
    }
  };
  const handleRecordingComplete = (videoUrl) => {
    setRecordedVideoUrl(videoUrl);
    setAppState("reels");
  };
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
      updateStatus("Generation timed out. Please try again.");
    }, 9e4);
    try {
      const content = await generateVideoContent(updateStatus, settings.scenesPerReel, reels.length, recordedVideoUrl);
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
  }, [settings.scenesPerReel, reels.length, recordedVideoUrl]);
  const loadInitialReels = useCallback(async () => {
    if (reels.length > 0 || generationLock.current) return;
    console.log(`[InfiniteReels] Loading ${settings.initialReels} initial reels sequentially...`);
    generationLock.current = true;
    setLoading(true);
    const initialReelsContent = [];
    for (let i = 0; i < settings.initialReels; i++) {
      try {
        updateStatus(`Generating Reel ${i + 1} of ${settings.initialReels}...`);
        const content = await generateVideoContent(updateStatus, settings.scenesPerReel, i, recordedVideoUrl);
        if (content) {
          initialReelsContent.push({
            id: Date.now() + i,
            ...content,
            timestamp: Date.now() + i
          });
          setReels([...initialReelsContent]);
        } else {
          console.warn(`[InfiniteReels] Reel ${i + 1} generation returned no content. Skipping.`);
        }
      } catch (error) {
        console.error(`[InfiniteReels] Error loading initial reel ${i + 1}:`, error);
        updateStatus(`Error generating reel ${i + 1}. Moving to next.`);
      }
    }
    console.log("[InfiniteReels] Initial reels loaded:", initialReelsContent);
    setLoading(false);
    generationLock.current = false;
  }, [reels.length, settings.initialReels, settings.scenesPerReel, recordedVideoUrl]);
  useEffect(() => {
    if (appState === "reels" && recordedVideoUrl) {
      loadInitialReels();
    }
  }, [appState, recordedVideoUrl, loadInitialReels]);
  useEffect(() => {
    if (appState !== "reels") return;
    const container = containerRef.current;
    if (!container) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index, 10);
            setCurrentIndex(index);
            if (settings.infiniteScrollMode === "auto" && index >= reels.length - 2) {
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
    const reelItems = container.querySelectorAll(".reel-item[data-index]");
    reelItems.forEach((item) => observer.observe(item));
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [reels, generateNewReel, settings.infiniteScrollMode, appState]);
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
              lineNumber: 364,
              columnNumber: 33
            }),
            /* @__PURE__ */ jsxDEV("div", { style: { fontSize: "12px", marginTop: "10px" }, children: [
              "Reel data: ",
              JSON.stringify(reel, null, 2)
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 365,
              columnNumber: 33
            })
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 354,
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
              lineNumber: 370,
              columnNumber: 29
            }
          ) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 352,
            columnNumber: 21
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "reel-overlay" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 397,
            columnNumber: 21
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "progress-bar", style: { width: `${videoProgress}%` } }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 399,
            columnNumber: 21
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "reel-metadata", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "reel-title", children: reel.title }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 402,
              columnNumber: 25
            }),
            /* @__PURE__ */ jsxDEV("div", { className: "reel-description", children: reel.description }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 403,
              columnNumber: 25
            }),
            reel.inputProps?.creator && /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", alignItems: "center", gap: 8, marginBottom: 10, opacity: 0.95 }, children: [
              /* @__PURE__ */ jsxDEV("img", { src: reel.inputProps.creator.avatar_url || `https://images.websim.com/avatar/${reel.inputProps.creator.username}`, alt: reel.inputProps.creator.username, style: { width: 24, height: 24, borderRadius: "50%" } }, void 0, false, {
                fileName: "<stdin>",
                lineNumber: 407,
                columnNumber: 33
              }),
              /* @__PURE__ */ jsxDEV("span", { style: { fontSize: 12, opacity: 0.9 }, children: [
                "by @",
                reel.inputProps.creator.username
              ] }, void 0, true, {
                fileName: "<stdin>",
                lineNumber: 408,
                columnNumber: 33
              })
            ] }, void 0, true, {
              fileName: "<stdin>",
              lineNumber: 406,
              columnNumber: 29
            }),
            /* @__PURE__ */ jsxDEV("div", { className: "reel-tags", children: reel.tags.map((tag, i) => /* @__PURE__ */ jsxDEV("span", { className: "tag", children: [
              "#",
              tag
            ] }, i, true, {
              fileName: "<stdin>",
              lineNumber: 413,
              columnNumber: 33
            })) }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 411,
              columnNumber: 25
            })
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 401,
            columnNumber: 21
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "controls-overlay", children: [
            /* @__PURE__ */ jsxDEV("div", { className: "control-btn", title: "Like", children: "\u2764\uFE0F" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 419,
              columnNumber: 25
            }),
            /* @__PURE__ */ jsxDEV("div", { className: "control-btn", title: "Remix", children: "\u{1F504}" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 420,
              columnNumber: 25
            }),
            /* @__PURE__ */ jsxDEV("div", { className: "control-btn", title: "Share", children: "\u{1F4E4}" }, void 0, false, {
              fileName: "<stdin>",
              lineNumber: 421,
              columnNumber: 25
            })
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 418,
            columnNumber: 21
          })
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 351,
          columnNumber: 17
        })
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 347,
        columnNumber: 13
      }
    );
  };
  if (appState === "settings") {
    return /* @__PURE__ */ jsxDEV(Settings, { onStart: handleStart }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 429,
      columnNumber: 16
    });
  }
  if (appState === "interaction") {
    return /* @__PURE__ */ jsxDEV(InteractionScreen, { onRecordingComplete: handleRecordingComplete, projectUrl }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 433,
      columnNumber: 16
    });
  }
  const showManualLoadButton = settings.infiniteScrollMode === "manual" && currentIndex === reels.length - 1 && !loading;
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
        lineNumber: 441,
        columnNumber: 17
      }
    )),
    loading && /* @__PURE__ */ jsxDEV("div", { className: "reel-item", children: /* @__PURE__ */ jsxDEV("div", { className: "reel-content loading-reel", children: [
      /* @__PURE__ */ jsxDEV("div", { className: "loading-spinner" }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 452,
        columnNumber: 25
      }),
      /* @__PURE__ */ jsxDEV("div", { className: "loading-text", children: loadingStatus }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 453,
        columnNumber: 25
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 451,
      columnNumber: 21
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 450,
      columnNumber: 17
    }),
    showManualLoadButton && /* @__PURE__ */ jsxDEV("div", { className: "reel-item", children: /* @__PURE__ */ jsxDEV("div", { className: "reel-content loading-reel", children: /* @__PURE__ */ jsxDEV("button", { onClick: generateNewReel, className: "start-button", children: "Generate Next Reel" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 461,
      columnNumber: 26
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 460,
      columnNumber: 21
    }) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 459,
      columnNumber: 18
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 439,
    columnNumber: 9
  });
};
var stdin_default = InfiniteReels;
export {
  stdin_default as default
};
