import * as api from './websim-api.js';

async function urlToDataUrl(url) {
    console.log("[urlToDataUrl] Attempting to fetch:", url);
    // If a websim helper exists for this, it's the best option.
    if (window.websim && window.websim.passthroughUrl) {
        try {
            console.log("[urlToDataUrl] Using websim.passthroughUrl()");
            const proxiedUrl = await window.websim.passthroughUrl(url);
            const response = await fetch(proxiedUrl);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            console.warn("[urlToDataUrl] websim.passthroughUrl() failed, trying direct fetch.", e);
        }
    }
    
    // --- Fallback Mechanism ---
    // 1. Try direct fetch first
    try {
        console.log("[urlToDataUrl] Attempting direct fetch.");
        const response = await fetch(url);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject; // Keep reject here for fallback chain
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn("[urlToDataUrl] Direct fetch failed due to CORS or network error. Trying CORS proxies.", error);
        
        // 2. If direct fetch fails, try CORS proxies
        const proxies = [
            'https://api.allorigins.win/raw?url=',
            'https://corsproxy.io/?',
        ];

        for (const proxy of proxies) {
            try {
                const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
                console.log(`[urlToDataUrl] Trying proxy: ${proxy.split('/')[2]}`);
                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error(`Proxy fetch failed with status ${response.status}`);
                const blob = await response.blob();
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                });
            } catch (proxyError) {
                console.warn(`[urlToDataUrl] Proxy ${proxy.split('/')[2]} failed.`, proxyError);
            }
        }

        console.error("[urlToDataUrl] All fetch attempts (direct and proxy) failed for URL:", url);
        return null; // Return null if all attempts fail
    }
}

// AI-powered video content generator using Websim metadata
export async function generateVideoContent(updateStatus, scenesPerReel = 3, reelIndex = 0) {
    const reelId = `Reel-${reelIndex + 1}`;
    try {
        updateStatus(`${reelId}: Fetching project data...`);
        console.log(`[VideoGenerator] ${reelId}: Starting video content generation...`);
        // Fetch websim project data for inspiration
        console.log(`[VideoGenerator] ${reelId}: Fetching websim project data...`);
        const projectData = await fetchWebsimProjectData();
        console.log(`[VideoGenerator] ${reelId}: Fetched project data:`, projectData.title);
        
        updateStatus(`${reelId}: Designing scenes with AI...`);
        console.log(`[VideoGenerator] ${reelId}: Generating AI concept script...`);
        const script = await generateAIConcept(projectData, scenesPerReel);
        console.log(`[VideoGenerator] ${reelId}: Generated AI script for "${script.title}"`);
        
        if (!script || !script.scenes || script.scenes.length === 0) {
            console.error(`[VideoGenerator] ${reelId}: AI script generation failed or returned empty scenes. Using fallback.`);
            return generateFallbackContent(scenesPerReel, projectData);
        }

        updateStatus(`${reelId}: Generating visual and audio assets...`);
        console.log(`[VideoGenerator] ${reelId}: Generating assets for ${script.scenes.length} scenes...`);

        // Generate images and audio in parallel
        const assetGenerationPromises = script.scenes.map((scene, i) => (async () => {
            const newScene = { ...scene }; // Create a copy to avoid race conditions on the original object
            // Image Generation
            if (newScene.visualConcept) {
                updateStatus(`${reelId} (Scene ${i + 1}/${script.scenes.length}): Generating visual...`);
                console.log(`[VideoGenerator] ${reelId} Scene ${i + 1}: Generating image for concept: "${newScene.visualConcept}"`);
                try {
                    const result = await websim.imageGen({
                        prompt: `${newScene.visualConcept}, in a ${newScene.style} style, cinematic lighting, high detail, vertical composition`,
                        width: 540,
                        height: 960,
                        aspect_ratio: "9:16"
                    });
                    newScene.imageUrl = result.url;
                    console.log(`[VideoGenerator] ${reelId} Scene ${i + 1}: Generated image URL: ${newScene.imageUrl}`);
                } catch (imgError) {
                    console.error(`[VideoGenerator] ${reelId} Scene ${i + 1}: Image generation failed.`, imgError);
                    newScene.imageUrl = 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1080&auto=format&fit=crop';
                }
            }

            // Audio Generation
            if (newScene.speech && newScene.speech.trim() !== "") {
                 updateStatus(`${reelId} (Scene ${i + 1}/${script.scenes.length}): Generating voiceover...`);
                 console.log(`[VideoGenerator] ${reelId} Scene ${i + 1}: Generating audio for speech: "${newScene.speech}"`);
                 try {
                    const result = await websim.textToSpeech({
                        text: newScene.speech,
                        voice: "en-male"
                    });
                    newScene.audioUrl = result.url;
                    console.log(`[VideoGenerator] ${reelId} Scene ${i + 1}: Generated audio URL: ${newScene.audioUrl}`);
                 } catch(audioError) {
                    console.error(`[VideoGenerator] ${reelId} Scene ${i + 1}: Audio generation failed.`, audioError);
                 }
            }
            return newScene;
        })());

        console.log(`[VideoGenerator] ${reelId}: Waiting for all asset generation promises to resolve...`);
        const updatedScenes = await Promise.all(assetGenerationPromises);
        script.scenes = updatedScenes;
        
        console.log(`[VideoGenerator] ${reelId}: All assets generated. Updated scenes:`, script.scenes);
        
        updateStatus(`${reelId}: Assembling your reel...`);
        console.log(`[VideoGenerator] ${reelId}: Calculating total duration...`);
        const totalDurationInSeconds = script.scenes.reduce((acc, scene) => acc + (scene.durationInSeconds || 3), 0);
        const durationInFrames = Math.max(180, Math.floor(totalDurationInSeconds * 30));
        console.log(`[VideoGenerator] ${reelId}: Total duration: ${totalDurationInSeconds}s (${durationInFrames} frames)`);
        
        console.log(`[VideoGenerator] ${reelId}: Creating final content object...`);
        const content = {
            title: script.title || projectData.title || "AI Video",
            description: script.description || projectData.description || "Generated content",
            tags: script.tags || ["ai", "video"],
            durationInFrames: durationInFrames,
            inputProps: {
                scenes: script.scenes,
                creator: projectData.creator,
                projectTitle: projectData.title
            }
        };
        
        console.log(`[VideoGenerator] ${reelId}: Finished video content generation.`);
        return content;
    } catch (error) {
        console.error(`[VideoGenerator] ${reelId}: Critical error in generateVideoContent:`, error);
        updateStatus(`An error occurred for ${reelId}. Retrying...`);
        return generateFallbackContent(scenesPerReel);
    }
}

async function fetchWithTimeout(resource, options = {}, timeout = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
        ...options,
        signal: controller.signal
    });
    clearTimeout(id);
    return response;
}

async function fetchWebsimProjectData() {
    let projectDetails = {};
    try {
        const res = await fetchWithTimeout("https://api.websim.com/api/v1/feed/trending?limit=24&offset=0&feed=hot_desktop&range=all");
        if (!res.ok) throw new Error(`Trending fetch failed with status ${res.status}`);
        const data = await res.json();
        const items = data?.feed?.data || [];
        if (!items.length) throw new Error("No trending items");
        
        const item = items[Math.floor(Math.random() * items.length)];
        const site = item.site || {};
        const project = item.project || {};
        const owner = site.owner || project.created_by || {};
        const link = site.versioned_link_url || site.link_url || project.versioned_link_url || project.link_url || "";
        const pageUrl = link ? `https://websim.com${link}` : "";

        projectDetails = {
            title: project.title || site.title || "Untitled",
            description: project.description || site.yapping?.split('\n')[0] || "",
            creator: {
                username: owner.username || "unknown",
                avatar_url: owner.avatar_url || null,
                id: owner.id || "unknown"
            },
            projectId: project.id || site.parent_id,
            category: "trending",
            pageUrl,
            thumbnail: project.thumbnail?.url || null,
            videoUrl: project.video?.url || null,
            screenshotUrl: item.project_revision?.current_screenshot_url || project.thumbnail?.url
        };

        // Fetch more details if we have a project ID
        if (projectDetails.projectId) {
            try {
                const revisions = await api.getAllProjectRevisions(projectDetails.projectId);
                projectDetails.revisionsSummary = revisions
                    .slice(0, 5)
                    .map(r => r.site?.yapping)
                    .filter(Boolean)
                    .join('\n---\n');

                const latestVersion = project.current_version || revisions[0]?.version;
                if (latestVersion) {
                    const assets = await api.getAssets(projectDetails.projectId, latestVersion);
                    const assetNames = assets.map(a => a.path).slice(0, 10);
                    if (assetNames.length > 0) {
                        projectDetails.assetsInfo = `Assets include: ${assetNames.join(', ')}`;
                    }
                }
            } catch (detailError) {
                console.warn("Could not fetch project details:", detailError);
            }
        }
        return projectDetails;
        
    } catch (error) {
        console.warn("Trending fetch failed, using fallback:", error);
        try {
            const currentProject = await window.websim?.getCurrentProject?.();
            const creator = await window.websim?.getCreator?.();
            if (currentProject && creator) {
                return { 
                    title: currentProject.title, 
                    description: currentProject.description, 
                    creator, 
                    projectId: currentProject.id, 
                    category: "current-project",
                    revisionsSummary: "",
                    assetsInfo: "",
                    screenshotUrl: null,
                };
            }
        } catch (e) { 
            console.warn("Fallback to current project failed:", e);
        }
        return { 
            title: "AI Creative Exploration", 
            description: "Discovering new frontiers in digital creativity", 
            creator: { username: "websim", avatar_url: null, id: "websim" }, 
            category: "technology",
            revisionsSummary: "",
            assetsInfo: "",
            screenshotUrl: null,
        };
    }
}

async function generateAIConcept(projectData, scenesPerReel) {
    try {
        const prompt = `
Create a compelling short video script for a Websim project, using the provided screenshot for visual context. The video should be dynamic, visually interesting, and tell a story about the project's creation and features.

**Project Context:**
- **Title:** ${projectData.title}
- **Creator:** @${projectData.creator.username}
- **Description:** ${projectData.description}
- **Development Insights (from AI's thought process):**
  ${projectData.revisionsSummary || "No development insights available."}
- **Project Assets:**
  ${projectData.assetsInfo || "No asset data available."}
- **Analyze the attached screenshot of the project to inform your creative choices.**

**Your Task:**
Based on all the provided context (text AND image), generate a JSON object for a multi-scene video. The JSON object must have the following structure:
{
  "title": "A catchy title for the video (max 50 chars)",
  "description": "A short, engaging description for the video (max 100 chars)",
  "tags": ["an", "array", "of", "3-5", "relevant", "tags"],
  "scenes": [
    {
      "durationInSeconds": 3,
      "visualConcept": "A detailed DALL-E prompt for an image that visually represents this scene, inspired by the project context and screenshot. Be descriptive and creative.",
      "text": "A short, impactful text overlay for this scene (max 30 chars). Can be empty.",
      "speech": "A voiceover script for this scene (max 150 chars). This should narrate the scene. Can be empty.",
      "colors": ["an", "array", "of", "2-3", "hex", "colors"],
      "animation": "Choose one: 'smooth-zoom', 'bouncy-pop', 'dramatic-pan', 'energetic-slide', 'minimal-fade'",
      "style": "Choose one: 'cyberpunk', 'minimal', 'retro', 'corporate', 'artistic'"
    }
  ]
}

Create exactly ${scenesPerReel} scenes that flow together to tell a story.
The total duration should be between ${scenesPerReel * 2} and ${scenesPerReel * 4} seconds.

Example flow:
1. **Hook:** An intriguing visual related to the project title and screenshot.
2. **Showcase:** A scene showing off a key feature or the project's purpose.
3. **Creator/CTA:** A scene mentioning the creator and the project title.

Be creative and make the concept reflect the essence of the project, heavily influenced by the provided screenshot.`;

        const messages = [{
            role: "user",
            content: [{ type: "text", text: prompt }]
        }];
        
        if (projectData.screenshotUrl) {
            console.log("[VideoGenerator] Converting screenshot to data URL for AI context...");
            const imageDataUrl = await urlToDataUrl(projectData.screenshotUrl);
            if (imageDataUrl) {
                messages[0].content.push({ type: "image_url", image_url: { url: imageDataUrl } });
                console.log("[VideoGenerator] Screenshot added to AI prompt.");
            } else {
                console.warn("[VideoGenerator] Could not convert screenshot to data URL. Proceeding without image context.");
            }
        }

        const completion = await websim.chat.completions.create({
            messages,
            json: true,
        });
        const parsedContent = JSON.parse(completion.content);

        // Basic validation
        if (!parsedContent.scenes || !Array.isArray(parsedContent.scenes) || parsedContent.scenes.length === 0) {
            console.warn("AI returned invalid scenes structure. Falling back.");
            return generateRandomConcept(projectData);
        }
        return parsedContent;

    } catch (error) {
        console.error("AI concept generation failed:", error);
        // Return a structured response that matches what the composition expects
        const randomConcept = generateRandomConcept(projectData);
        return {
            title: randomConcept.title,
            description: randomConcept.description,
            tags: randomConcept.tags,
            scenes: Array.from({ length: scenesPerReel }, () => ({
                durationInSeconds: 10 / scenesPerReel,
                visualConcept: randomConcept.visualConcept,
                text: randomConcept.text,
                speech: randomConcept.speech,
                colors: randomConcept.colors,
                animation: randomConcept.animation,
                style: randomConcept.style
            }))
        };
    }
}

function generateRandomConcept(projectData) {
    const concepts = [
        {
            title: "Digital Dreams",
            description: "Exploring the intersection of AI and creativity",
            tags: ["ai", "creativity", "digital", "future"],
            visualConcept: "Flowing particles forming geometric shapes",
            colors: ["#00ffff", "#ff00ff", "#ffffff"],
            animation: "smooth-zoom",
            text: projectData.title,
            speech: "Witness the birth of new ideas.",
            style: "cyberpunk"
        },
        {
            title: "Code Poetry",
            description: "When programming becomes art",
            tags: ["code", "art", "programming", "visual"],
            visualConcept: "Code transforming into visual art",
            colors: ["#00ff00", "#ffffff", "#000000"],
            animation: "dramatic-pan",
            text: "Create. Code. Inspire.",
            speech: "Every line of code tells a story.",
            style: "minimal"
        },
        {
            title: "Neon Futures",
            description: "Visions of tomorrow's digital landscape",
            tags: ["future", "neon", "tech", "vision"],
            visualConcept: "Neon grids and flowing data streams",
            colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
            animation: "bouncy-pop",
            text: projectData.title,
            speech: "Step into the world of tomorrow.",
            style: "retro"
        }
    ];
    
    return concepts[Math.floor(Math.random() * concepts.length)];
}

function generateFallbackContent(scenesPerReel = 3, projectData = null) {
    const defaultCreator = { username: "websim", avatar_url: null, id: "websim" };
    const defaultTitle = "AI Creativity";

    const scenes = Array.from({ length: scenesPerReel }, (_, i) => ({
        durationInSeconds: 10 / scenesPerReel,
        visualConcept: `Abstract geometric pattern #${i + 1}`,
        imageUrl: `https://picsum.photos/seed/${Date.now() + i}/540/960`,
        speech: "AI is creating new worlds.",
        audioUrl: null,
        colors: ["#00ffff", "#ff00ff", "#ffffff"],
        animation: "smooth-zoom",
        text: "AI Creativity",
        style: "cyberpunk"
    }));

    return {
        title: "AI Generated Content",
        description: "Explore the possibilities of AI creativity",
        tags: ["ai", "generated", "creative"],
        durationInFrames: 300,
        inputProps: {
            scenes: scenes,
            creator: projectData?.creator || defaultCreator,
            projectTitle: projectData?.title || defaultTitle
        }
    };
}