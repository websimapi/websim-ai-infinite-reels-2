import * as api from './websim-api.js';

// AI-powered video content generator using Websim metadata
export async function generateVideoContent() {
    try {
        // Fetch websim project data for inspiration
        const projectData = await fetchWebsimProjectData();
        
        // Generate AI video concept based on project metadata
        const script = await generateAIConcept(projectData);

        // Generate images for each scene
        const imageGenerationPromises = script.scenes.map(async (scene) => {
            if (scene.visualConcept) {
                try {
                    console.log(`Generating image for concept: "${scene.visualConcept}" with style: ${scene.style}`);
                    const result = await websim.imageGen({
                        prompt: `${scene.visualConcept}, in a ${scene.style} style, cinematic lighting, high detail, vertical composition`,
                        width: 540,
                        height: 960,
                        aspect_ratio: "9:16"
                    });
                    scene.imageUrl = result.url;
                    console.log(`Generated image URL: ${scene.imageUrl}`);
                } catch (imgError) {
                    console.error("Image generation failed for scene:", scene, imgError);
                    // Using a placeholder image on failure
                    scene.imageUrl = 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1080&auto=format&fit=crop'; 
                }
            }
            return scene;
        });

        script.scenes = await Promise.all(imageGenerationPromises);
        
        // Calculate total duration from scene scripts
        const totalDurationInSeconds = script.scenes.reduce((acc, scene) => acc + (scene.durationInSeconds || 3), 0);
        const durationInFrames = Math.max(180, Math.floor(totalDurationInSeconds * 30));
        
        // Create video configuration with validation
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
        
        console.log("Generated video content:", content);
        return content;
    } catch (error) {
        console.error("Error generating video content:", error);
        return generateFallbackContent();
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
            videoUrl: project.video?.url || null
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
                    assetsInfo: ""
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
            assetsInfo: ""
        };
    }
}

async function generateAIConcept(projectData) {
    try {
        const prompt = `
Create a compelling short video script for a Websim project. The video should be dynamic, visually interesting, and tell a story about the project's creation and features. Total duration should be around 10-15 seconds.

**Project Context:**
- **Title:** ${projectData.title}
- **Creator:** @${projectData.creator.username}
- **Description:** ${projectData.description}
- **Category:** ${projectData.category}
- **Development Insights (from AI's thought process):**
  ${projectData.revisionsSummary || "No development insights available."}
- **Project Assets:**
  ${projectData.assetsInfo || "No asset data available."}

**Your Task:**
Based on all the provided context, generate a JSON object for a multi-scene video. The JSON object should have the following structure:
{
  "title": "A catchy title for the video (max 50 chars)",
  "description": "A short, engaging description for the video (max 100 chars)",
  "tags": ["an", "array", "of", "3-5", "relevant", "tags"],
  "scenes": [
    {
      "durationInSeconds": 3,
      "visualConcept": "A detailed DALL-E prompt for an image that visually represents this scene. Be descriptive and creative. This will be used to generate an asset.",
      "text": "A short, impactful text overlay for this scene (max 30 chars). Can be empty.",
      "colors": ["an", "array", "of", "2-3", "hex", "colors"],
      "animation": "Choose one: 'smooth', 'bouncy', 'dramatic', 'energetic'",
      "style": "Choose one: 'cyberpunk', 'minimal', 'retro', 'corporate', 'artistic'"
    }
  ]
}

Create 2 to 4 scenes that flow together to tell a story. For example:
1. **Hook:** An intriguing visual related to the project title. (2-3 seconds)
2. **Showcase:** A scene showing off a key feature or the project's purpose. (4-6 seconds)
3. **Creator/CTA:** A scene mentioning the creator and the project title. (3-4 seconds)

Be creative and make the concept reflect the essence of the project. Ensure the total duration is between 10 and 15 seconds.`;

        const completion = await websim.chat.completions.create({
            messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
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
            scenes: [{
                durationInSeconds: 10,
                visualConcept: randomConcept.visualConcept,
                text: randomConcept.text,
                colors: randomConcept.colors,
                animation: randomConcept.animation,
                style: randomConcept.style
            }]
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
            animation: "smooth",
            text: projectData.title,
            style: "cyberpunk"
        },
        {
            title: "Code Poetry",
            description: "When programming becomes art",
            tags: ["code", "art", "programming", "visual"],
            visualConcept: "Code transforming into visual art",
            colors: ["#00ff00", "#ffffff", "#000000"],
            animation: "dramatic",
            text: "Create. Code. Inspire.",
            style: "minimal"
        },
        {
            title: "Neon Futures",
            description: "Visions of tomorrow's digital landscape",
            tags: ["future", "neon", "tech", "vision"],
            visualConcept: "Neon grids and flowing data streams",
            colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
            animation: "bouncy",
            text: projectData.title,
            style: "retro"
        }
    ];
    
    return concepts[Math.floor(Math.random() * concepts.length)];
}

function generateFallbackContent() {
    const scene = {
        durationInSeconds: 10,
        visualConcept: "Abstract geometric patterns",
        imageUrl: 'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1080&auto=format&fit=crop',
        colors: ["#00ffff", "#ff00ff", "#ffffff"],
        animation: "smooth",
        text: "AI Creativity",
        style: "cyberpunk"
    };

    return {
        title: "AI Generated Content",
        description: "Explore the possibilities of AI creativity",
        tags: ["ai", "generated", "creative"],
        durationInFrames: 300,
        inputProps: {
            scenes: [scene],
            creator: { username: "websim", avatar_url: null, id: "websim" },
            projectTitle: "AI Creativity"
        }
    };
}