import * as api from './websim-api.js';

async function getAudioDuration(url) {
    return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.preload = 'metadata';
        
        const timeout = setTimeout(() => {
            reject(new Error("Audio duration check timed out after 10 seconds."));
        }, 10000);

        audio.onloadedmetadata = () => {
            clearTimeout(timeout);
            resolve(audio.duration);
        };
        audio.onerror = (e) => {
            clearTimeout(timeout);
            console.error("Error loading audio for duration check:", url, e);
            reject(new Error("Could not load audio metadata."));
        };
        audio.src = url;
    });
}

async function scrapeProjectImages(url) {
    if (!url) return [];
    console.log(`[scrapeProjectImages] Starting scrape for URL: ${url}`);
    
    const proxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
    ];

    for (const proxy of proxies) {
        try {
            const proxyUrl = `${proxy}${encodeURIComponent(url)}`;
            const proxyName = proxy.split('/')[2] || 'direct';
            console.log(`[scrapeProjectImages] Trying proxy: ${proxyName}`);
            
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error(`Proxy fetch failed with status ${response.status}`);
            
            const html = await response.text();
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const images = Array.from(doc.querySelectorAll('img'));
            
            const imageUrls = images
                .map(img => img.src || img.dataset.src) // Check src and data-src for lazy loaded images
                .filter(Boolean)
                .map(src => {
                    try {
                        return new URL(src, url).href;
                    } catch (e) {
                        return null; // Invalid URL
                    }
                })
                .filter(Boolean);

            if (imageUrls.length > 0) {
                console.log(`[scrapeProjectImages] Successfully scraped ${imageUrls.length} image URLs using ${proxyName}.`);
                return imageUrls;
            }
        } catch (error) {
            const proxyName = proxy.split('/')[2] || 'direct';
            console.warn(`[scrapeProjectImages] Proxy ${proxyName} failed.`, error);
        }
    }
    
    console.error(`[scrapeProjectImages] All scraping attempts failed for URL: ${url}`);
    return [];
}


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
export async function generateVideoContent(updateStatus, scenesPerReel = 3, reelIndex = 0, recordedVideoUrl = null) {
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
        const script = await generateAIConcept(projectData, scenesPerReel, recordedVideoUrl);
        console.log(`[VideoGenerator] ${reelId}: Generated AI script for "${script.title}"`);
        
        if (!script || !script.scenes || script.scenes.length === 0) {
            console.error(`[VideoGenerator] ${reelId}: AI script generation failed or returned empty scenes. Using fallback.`);
            return generateFallbackContent(scenesPerReel, projectData);
        }

        updateStatus(`${reelId}: Generating visual and audio assets...`);
        console.log(`[VideoGenerator] ${reelId}: Generating assets sequentially for ${script.scenes.length} scenes...`);

        // Generate assets sequentially to avoid overwhelming services and for clearer progress.
        const updatedScenes = [];
        for (let i = 0; i < script.scenes.length; i++) {
            const scene = script.scenes[i];
            const sceneNum = i + 1;
            console.log(`[VideoGenerator] ${reelId}: Starting asset generation for Scene ${sceneNum}...`);

            // --- Path Correction Logic ---
            // If imageUrl is a relative path (e.g., /swirl.png or swirl.png), try to resolve it with project assets.
            if (scene.imageUrl && !scene.imageUrl.startsWith('http')) {
                const assetName = scene.imageUrl.startsWith('/') ? scene.imageUrl.substring(1) : scene.imageUrl;
                const projectAsset = projectData.assets?.find(a => a.path === assetName);
                if (projectAsset && projectAsset.url) {
                    console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Resolved relative path ${scene.imageUrl} to ${projectAsset.url}`);
                    scene.imageUrl = projectAsset.url;
                } else {
                    console.warn(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Could not resolve relative image path: ${scene.imageUrl}. It will likely fail to load.`);
                }
            }

            // Correct paths in layers as well
            if(scene.layers && Array.isArray(scene.layers)) {
                for (const layer of scene.layers) {
                    if (layer.type === 'image' && layer.content && !layer.content.startsWith('http')) {
                        const assetName = layer.content.startsWith('/') ? layer.content.substring(1) : layer.content;
                        const projectAsset = projectData.assets?.find(a => a.path === assetName);
                        if (projectAsset && projectAsset.url) {
                           console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum} Layer: Resolved relative path ${layer.content} to ${projectAsset.url}`);
                           layer.content = projectAsset.url;
                        } else {
                           console.warn(`[VideoGenerator] ${reelId} Scene ${sceneNum} Layer: Could not resolve relative image path: ${layer.content}. It will likely fail to load.`);
                        }
                    }
                }
            }
            // --- End Path Correction ---

            // Image Generation: Use project image if AI chose one, otherwise generate a new one.
            if (scene.imageUrl && typeof scene.imageUrl === 'string' && scene.imageUrl.startsWith('http')) {
                updateStatus(`${reelId} (Scene ${sceneNum}/${script.scenes.length}): Using project visual...`);
                console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Using pre-existing image URL from project: ${scene.imageUrl}`);
            } else if (scene.visualConcept) {
                updateStatus(`${reelId} (Scene ${sceneNum}/${script.scenes.length}): Generating visual...`);
                console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Generating image for concept: "${scene.visualConcept}"`);
                try {
                    const result = await websim.imageGen({
                        prompt: `${scene.visualConcept}, in a ${scene.style} style, cinematic lighting, high detail, vertical composition`,
                        width: 540,
                        height: 960,
                        aspect_ratio: "9:16"
                    });
                    scene.imageUrl = result.url;
                    console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Generated image URL: ${scene.imageUrl}`);
                } catch (imgError) {
                    console.error(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Image generation failed. Using fallback.`, imgError);
                    scene.imageUrl = `https://picsum.photos/seed/${Date.now() + i}/540/960`; // Fallback
                }
            } else {
                 console.warn(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Scene has neither a valid imageUrl nor a visualConcept. Using fallback image.`);
                 scene.imageUrl = `https://picsum.photos/seed/${Date.now() + i}/540/960`;
            }

            // Audio Generation
            if (scene.speech && scene.speech.trim() !== "") {
                 updateStatus(`${reelId} (Scene ${sceneNum}/${script.scenes.length}): Generating voiceover...`);
                 console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Generating audio for speech: "${scene.speech}"`);
                 try {
                    const result = await websim.textToSpeech({
                        text: scene.speech,
                        voice: "en-male"
                    });
                    scene.audioUrl = result.url;
                    console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Generated audio URL: ${scene.audioUrl}`);

                    try {
                        updateStatus(`${reelId} (Scene ${sceneNum}/${script.scenes.length}): Analyzing voiceover...`);
                        const duration = await getAudioDuration(scene.audioUrl);
                        console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Audio duration is ${duration.toFixed(2)}s.`);
                        // Set scene duration to audio duration + a small buffer for transition
                        const aiDuration = scene.durationInSeconds;
                        const clipDuration = scene.videoClip?.duration;

                        if (clipDuration) {
                            scene.durationInSeconds = clipDuration;
                            console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Duration set to video clip duration: ${clipDuration.toFixed(2)}s.`);
                        } else {
                             try {
                                updateStatus(`${reelId} (Scene ${sceneNum}/${script.scenes.length}): Analyzing voiceover...`);
                                const duration = await getAudioDuration(scene.audioUrl);
                                console.log(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Audio duration is ${duration.toFixed(2)}s.`);
                                scene.durationInSeconds = duration + 0.5; // Audio + buffer
                             } catch (durationError) {
                                console.warn(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Could not get audio duration. Using AI-provided duration.`, durationError);
                                scene.durationInSeconds = aiDuration || 3;
                             }
                        }

                    } catch (durationError) {
                        console.warn(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Could not get audio duration. Using AI-provided duration.`, durationError);
                        scene.durationInSeconds = aiDuration || 3;
                    }

                 } catch(audioError) {
                    console.error(`[VideoGenerator] ${reelId} Scene ${sceneNum}: Audio generation failed.`, audioError);
                    scene.audioUrl = null; // Ensure it's null on failure
                    scene.durationInSeconds = scene.videoClip?.duration || scene.durationInSeconds || 3;
                }
            } else {
                // If no speech, use clip duration, AI duration, or default to 3 seconds.
                scene.durationInSeconds = scene.videoClip?.duration || scene.durationInSeconds || 3;
            }
            updatedScenes.push(scene);
            console.log(`[VideoGenerator] ${reelId}: Completed asset generation for Scene ${sceneNum}.`);
        }
        
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
                projectTitle: projectData.title,
                recordedVideoUrl: recordedVideoUrl, // Pass this to composition
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

export async function fetchWebsimProjectData() {
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
        console.log(`[VideoGenerator] Project has video: ${!!projectDetails.videoUrl}`);

        // NEW: Scrape images from the project's page to use in the video
        if (projectDetails.pageUrl) {
            try {
                const allImages = await scrapeProjectImages(projectDetails.pageUrl);
                projectDetails.scrapedImages = allImages
                    .filter(img => !img.startsWith('data:') && !img.includes('.svg') && !img.includes('avatar'))
                    .slice(0, 5); // Limit to 5 to keep the prompt clean
                if (projectDetails.scrapedImages.length > 0) {
                    console.log(`[VideoGenerator] Found ${projectDetails.scrapedImages.length} usable images from project page.`);
                }
            } catch (scrapeError) {
                console.warn("Could not scrape project images:", scrapeError);
                projectDetails.scrapedImages = [];
            }
        }

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
                    projectDetails.assets = assets; // Store full asset list
                    const assetNames = assets.map(a => a.path).slice(0, 10);
                    if (assetNames.length > 0) {
                        projectDetails.assetsInfo = `Assets include: ${assetNames.join(', ')}`;
                    }

                    // NEW: Try to fetch content of index.html for more context
                    const htmlAsset = assets.find(a => a.path === 'index.html');
                    if (htmlAsset && htmlAsset.url) {
                        try {
                           const htmlRes = await fetchWithTimeout(htmlAsset.url);
                           if (htmlRes.ok) {
                               const htmlContent = await htmlRes.text();
                               // Sanitize and truncate for prompt
                               const cleanedHtml = htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '').replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
                               projectDetails.htmlContent = cleanedHtml.substring(0, 3000);
                               console.log("[VideoGenerator] Fetched and processed index.html content.");
                           }
                        } catch(htmlError) {
                            console.warn("Could not fetch index.html content:", htmlError);
                        }
                    }
                    
                    // NEW: Fetch CSS and JS content
                    projectDetails.codeAssets = {};
                    const codeFileExtensions = ['.js', '.css', '.jsx', '.ts', '.tsx'];
                    // Prioritize common entry point names
                    const sortedAssets = [...assets].sort((a, b) => {
                        const commonNames = ['main.js', 'index.js', 'app.js', 'script.js', 'styles.css', 'style.css'];
                        const aScore = commonNames.indexOf(a.path.toLowerCase());
                        const bScore = commonNames.indexOf(b.path.toLowerCase());
                        if (aScore !== -1 && bScore !== -1) return aScore - bScore;
                        if (aScore !== -1) return -1;
                        if (bScore !== -1) return 1;
                        return 0;
                    });

                    const codeAssets = sortedAssets.filter(a => codeFileExtensions.some(ext => a.path.endsWith(ext))).slice(0, 7); // limit to 7 other files

                    for (const asset of codeAssets) {
                        try {
                           const res = await fetchWithTimeout(asset.url);
                           if (res.ok) {
                               const content = await res.text();
                               projectDetails.codeAssets[asset.path] = content.substring(0, 2500); // truncate
                               console.log(`[VideoGenerator] Fetched content of ${asset.path}.`);
                           }
                        } catch(codeError) {
                            console.warn(`Could not fetch content for ${asset.path}:`, codeError);
                        }
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

async function generateAIConcept(projectData, scenesPerReel, recordedVideoUrl) {
    try {
        const scrapedImagesInfo = (projectData.scrapedImages && projectData.scrapedImages.length > 0)
            ? `
**Project Images Available:**
You can use these image URLs directly as the main background visual or in a layer. When you use one as a background, set the "imageUrl" field for that scene and leave "visualConcept" empty.
- ${projectData.scrapedImages.join('\n- ')}
`
            : "**No project images were found.** You must generate a 'visualConcept' for every scene's background.";

        const interactionVideoInfo = recordedVideoUrl
            ? `
**User Interaction Video Available:**
A video of a user interacting with the project is available at this URL: ${recordedVideoUrl}
You can use clips from this video as a scene's background. To do this, set "videoUrl" to this URL, and specify the "videoClip" object. A mix of interaction clips and generated images is highly encouraged.
`
            : "";

        const videoAssetInfo = projectData.videoUrl 
            ? `
**Project Video Available:**
A video of the project is available at this URL: ${projectData.videoUrl}
You can use this video as a scene's background by setting the "videoUrl" field to this URL. You can also generate new images. A mix is good.
`
            : "**No project video was found.** You must use 'imageUrl' or 'visualConcept' for backgrounds.";

        const htmlContext = projectData.htmlContent
            ? `
**Project HTML Content (for context on structure):**
\`\`\`html
${projectData.htmlContent}
\`\`\`
` : "";

        const codeContext = (projectData.codeAssets && Object.keys(projectData.codeAssets).length > 0)
            ? `
**Project Code Snippets (for context on functionality and style):**
${Object.entries(projectData.codeAssets).map(([path, content]) => `
---
File: ${path}
\`\`\`${path.split('.').pop()}
${content}
\`\`\`
`).join('\n')}
` : "";


        const prompt = `
Create a compelling short video script for a Websim project. The video must be dynamic, multi-layered, and tell a story about the project's features and creation, using all available context. Your main goal is to simulate a user's journey through the web application by analyzing its code and the provided user interaction video.

**Project Context:**
- **Title:** ${projectData.title}
- **Creator:** @${projectData.creator.username}
- **Description:** ${projectData.description}
- **Analyze the attached screenshot of the project to inform your creative choices.**
${htmlContext}
${codeContext}
- **Development Insights (AI's thought process):**
  ${projectData.revisionsSummary || "No development insights available."}
- **Project Assets:**
  ${projectData.assetsInfo || "No asset data available."}
${scrapedImagesInfo}
${interactionVideoInfo}
${videoAssetInfo}

**Your Task: Analyze Interaction & Create a Video Story**
Analyze the provided user interaction video, HTML, CSS, and JavaScript files to understand the webpage's structure, style, and interactive elements. Then, generate a JSON object for a multi-scene video that tells a story of a user exploring the page.

**Using the Interaction Video:**
When you use a clip from the user interaction video, set the scene's "videoUrl" to the provided interaction video URL. Then, you MUST define the "videoClip" object with a "start" time (in seconds) and a "duration" (in seconds). This will create a dynamic scene showing actual usage. For these scenes, "visualConcept" and "imageUrl" should be empty.

**JSON Structure:**
{
  "title": "A catchy title for the video (max 50 chars)",
  "description": "A short, engaging description for the video (max 100 chars)",
  "tags": ["an", "array", "of", "3-5", "relevant", "tags"],
  "scenes": [
    {
      "durationInSeconds": 3,
      "visualConcept": "A detailed DALL-E prompt for a background image. LEAVE EMPTY IF USING imageUrl or videoUrl.",
      "imageUrl": "URL of an image from 'Project Images'. LEAVE EMPTY IF USING visualConcept or videoUrl.",
      "videoUrl": "URL of the interaction video or project video. If using the interaction video, you MUST specify videoClip.",
      "videoClip": { "start": 10.5, "duration": 4.0 },
      "speech": "A voiceover script for this scene (max 150 chars). This narrates the user's action or the feature being shown.",
      "colors": ["an", "array", "of", "2-3", "hex", "colors"],
      "animation": "Background animation. Choose: 'smooth-zoom', 'bouncy-pop', 'dramatic-pan', 'energetic-slide', 'minimal-fade'",
      "style": "Overall scene style. Choose: 'cyberpunk', 'minimal', 'retro', 'corporate', 'artistic'",
      "layers": [
        {
          "type": "text",
          "content": "Your text here",
          "fontSize": 72,
          "fontFamily": "default or monospace",
          "fontWeight": "bold or normal",
          "color": "#ffffff",
          "position": {"x": 10, "y": 40},
          "size": {"width": 80},
          "animation": "Choose: 'fade-in', 'pop-up', 'slide-in-left', 'slide-in-right'",
          "timing": {"start": 0.5, "end": 2.5}
        }
      ]
    }
  ]
}

**Instructions & Rules:**
1.  Create exactly ${scenesPerReel} scenes.
2.  Each scene MUST have a background: either "visualConcept", "imageUrl", or "videoUrl". Prioritize using clips from the user interaction video.
3.  When using the interaction video, you MUST define "videoClip" with "start" and "duration", and set "durationInSeconds" to be equal to "videoClip.duration".
4.  Each scene MUST have at least one layer. Layers are for foreground elements.
5.  Use the "layers" array to add dynamic text, shapes, or images on top of the background.
6.  The "speech" for each scene should create a coherent narrative.
7.  Total video duration should be between ${scenesPerReel * 2.5} and ${scenesPerReel * 5} seconds.

Make the video tell a story. Example flow:
1.  **Hook:** Use a dynamic, short clip from the interaction video showing an engaging moment.
2.  **Showcase:** Use another clip or a generated image to highlight a specific feature.
3.  **Creator/CTA:** A final dynamic scene with the project title and creator's name.

Be creative and make the concept reflect the essence of the project, heavily influenced by all the provided context including the code and user recording.`;

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
            return generateRandomConcept(projectData, scenesPerReel);
        }
        return parsedContent;

    } catch (error) {
        console.error("AI concept generation failed:", error);
        return generateRandomConcept(projectData, scenesPerReel);
    }
}

function generateRandomConcept(projectData, scenesPerReel) {
    const concepts = [
        {
            title: "Digital Dreams",
            description: "Exploring the intersection of AI and creativity",
            tags: ["ai", "creativity", "digital", "future"],
            sceneBase: {
                visualConcept: "Flowing particles forming geometric shapes",
                colors: ["#00ffff", "#ff00ff", "#ffffff"],
                animation: "smooth-zoom",
                speech: "Witness the birth of new ideas.",
                style: "cyberpunk",
                 layers: [{
                    type: "text",
                    content: projectData.title,
                    fontSize: 72,
                    fontFamily: "default",
                    fontWeight: "bold",
                    color: "#ffffff",
                    position: {x:10, y:40},
                    size: {width: 80},
                    animation: "fade-in",
                    timing: {start: 0.5, end: 2.5}
                }]
            }
        },
    ];
    
    const concept = concepts[Math.floor(Math.random() * concepts.length)];
    
    return {
        title: concept.title,
        description: concept.description,
        tags: concept.tags,
        scenes: Array.from({ length: scenesPerReel }, (_, i) => ({
            durationInSeconds: 10 / scenesPerReel,
            ...concept.sceneBase,
            layers: [{
                ...concept.sceneBase.layers[0],
                content: i === 0 ? projectData.title : `Scene ${i + 1}`
            }]
        }))
    };
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
        text: "AI Creativity", // Legacy
        layers: [{ // New
            type: "text",
            content: "AI Creativity",
            fontSize: 72,
            fontFamily: "default",
            fontWeight: "bold",
            color: "#ffffff",
            position: { x: 10, y: 40 },
            size: { width: 80 },
            animation: "fade-in",
            timing: { start: 0.5, end: 2.5 }
        }],
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