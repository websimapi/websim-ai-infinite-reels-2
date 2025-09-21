import * as api from './websim-api.js';

// AI-powered video content generator using Websim metadata
export async function generateVideoContent() {
    try {
        // Fetch websim project data for inspiration
        const projectData = await fetchWebsimProjectData();
        
        // Generate AI video concept based on project metadata
        const concept = await generateAIConcept(projectData);
        
        // Create video configuration with validation
        const content = {
            title: concept.title || projectData.title || "AI Video",
            description: concept.description || projectData.description || "Generated content",
            tags: concept.tags || ["ai", "video"],
            durationInFrames: 300, // Increased duration for more complex scenes
            inputProps: {
                concept: concept.visualConcept || "Abstract art",
                colors: concept.colors || ["#00ffff", "#ff00ff", "#ffffff"],
                animation: concept.animation || "smooth",
                text: concept.text || projectData.title || "AI Video",
                style: concept.style || "cyberpunk",
                // Add creator and project info
                creator: projectData.creator,
                projectTitle: projectData.title,
                projectDescription: projectData.description
            }
        };
        
        console.log("Generated video content:", content);
        return content;
    } catch (error) {
        console.error("Error generating video content:", error);
        return generateFallbackContent();
    }
}

async function fetchWebsimProjectData() {
    let projectDetails = {};
    try {
        const res = await fetch("https://api.websim.com/api/v1/feed/trending?limit=24&offset=0&feed=hot_desktop&range=all");
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

        let codeHtml = "";
        try {
            if (pageUrl) {
                // Fetching project page HTML can be slow and flaky, let's add a timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                const pageRes = await fetch(pageUrl, { signal: controller.signal, mode: 'no-cors' }); // Using no-cors to avoid CORS issues, we can't read the body but the request is made. Let's rely on API data.
                clearTimeout(timeoutId);
                // codeHtml = await pageRes.text();
                // codeHtml = codeHtml.slice(0, 4000);
            }
        } catch (e) {
            console.warn("Could not fetch page HTML:", e.message);
        }
        
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
            codeHtml
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
Create a compelling short video concept for a Websim project. The video should be dynamic, visually interesting, and tell a story about the project's creation and features.

**Project Context:**
- **Title:** ${projectData.title}
- **Creator:** @${projectData.creator.username}
- **Description:** ${projectData.description}
- **Category:** ${projectData.category}

**Development Insights (from AI's thought process):**
${projectData.revisionsSummary || "No development insights available."}

**Project Assets:**
${projectData.assetsInfo || "No asset data available."}

**Your Task:**
Based on all the provided context, generate a JSON object for a 10-second video. The JSON object should have the following structure:
{
  "title": "A catchy title for the video (max 50 chars)",
  "description": "A short, engaging description for the video (max 100 chars)",
  "tags": ["an", "array", "of", "3-5", "relevant", "tags"],
  "visualConcept": "A descriptive plan for the visuals. Describe what happens in the video second-by-second. Be creative!",
  "colors": ["an", "array", "of", "2-3", "hex", "colors", "that", "match", "the", "mood"],
  "animation": "Choose one: 'smooth', 'bouncy', 'dramatic', 'energetic'",
  "text": "A short, impactful text overlay for the video (max 30 chars).",
  "style": "Choose one: 'cyberpunk', 'minimal', 'retro', 'corporate', 'artistic'"
}

Be creative and make the concept reflect the essence of the project.`;

        const completion = await websim.chat.completions.create({
            messages: [{ role: "user", content: [{ type: "text", text: prompt }] }],
            json: true,
        });
        return JSON.parse(completion.content);
    } catch (error) {
        console.error("AI concept generation failed:", error);
        return generateRandomConcept(projectData);
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
    return {
        title: "AI Generated Content",
        description: "Explore the possibilities of AI creativity",
        tags: ["ai", "generated", "creative"],
        durationInFrames: 300,
        inputProps: {
            concept: "Abstract geometric patterns",
            colors: ["#00ffff", "#ff00ff", "#ffffff"],
            animation: "smooth",
            text: "AI Creativity",
            style: "cyberpunk"
        }
    };
}