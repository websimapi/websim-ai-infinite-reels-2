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
            durationInFrames: 180,
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
    try {
        const res = await fetch("https://api.websim.com/api/v1/feed/trending?limit=24&offset=0&feed=hot_desktop&range=all");
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
                const pageRes = await fetch(pageUrl, { mode: "cors" });
                codeHtml = await pageRes.text();
                codeHtml = codeHtml.slice(0, 4000);
            }
        } catch (e) { /* swallow code fetch errors */ }
        return {
            title: project.title || site.title || "Untitled",
            description: project.description || "",
            creator: {
                username: owner.username || "unknown",
                avatar_url: owner.avatar_url || null,
                id: owner.id || "unknown"
            },
            projectId: project.id || site.id,
            category: "trending",
            pageUrl,
            thumbnail: project.thumbnail?.url || item.site?.thumbnail?.url || null,
            videoUrl: project.video?.url || null,
            codeHtml
        };
    } catch (error) {
        console.log("Trending fetch failed, using fallback:", error);
        try {
            const currentProject = await window.websim?.getCurrentProject?.();
            const creator = await window.websim?.getCreator?.();
            if (currentProject && creator) return { title: currentProject.title, description: currentProject.description, creator, projectId: currentProject.id, category: "current-project", pageUrl: "", thumbnail: null, videoUrl: null, codeHtml: "" };
        } catch (e) { console.log("Fallback to current project failed:", e); }
        return { title: "AI Creative Exploration", description: "Discovering new frontiers in digital creativity", creator: { username: "websim", avatar_url: null, id: "websim" }, category: "technology", pageUrl: "", thumbnail: null, videoUrl: null, codeHtml: "" };
    }
}

async function generateAIConcept(projectData) {
    try {
        const prompt = `Create a short video concept about this Websim project using its metadata and page HTML.
Title: ${projectData.title}
Description: ${projectData.description}
Creator: ${projectData.creator.username}
Category: ${projectData.category}
URL: ${projectData.pageUrl}
Thumbnail: ${projectData.thumbnail || "none"}
Video: ${projectData.videoUrl || "none"}

PAGE_HTML_SNIPPET_START
${projectData.codeHtml || ""}
PAGE_HTML_SNIPPET_END

Respond with JSON:
- title (<=50 chars)
- description (<=100 chars)
- tags (3-5 hashtags, no # symbol in values)
- visualConcept
- colors (2-3 hex)
- animation
- text
- style`;

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
        durationInFrames: 180,
        inputProps: {
            concept: "Abstract geometric patterns",
            colors: ["#00ffff", "#ff00ff", "#ffffff"],
            animation: "smooth",
            text: "AI Creativity",
            style: "cyberpunk"
        }
    };
}