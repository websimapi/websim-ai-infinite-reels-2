// AI-powered video content generator using Websim metadata
export async function generateVideoContent() {
    try {
        // Fetch trending Websim content for inspiration
        const websimData = await fetchWebsimMetadata();
        
        // Generate AI video concept based on metadata
        const concept = await generateAIConcept(websimData);
        
        // Create video configuration with validation
        const content = {
            title: concept.title || "AI Video",
            description: concept.description || "Generated content",
            tags: concept.tags || ["ai", "video"],
            durationInFrames: 180,
            inputProps: {
                concept: concept.visualConcept || "Abstract art",
                colors: concept.colors || ["#00ffff", "#ff00ff", "#ffffff"],
                animation: concept.animation || "smooth",
                text: concept.text || concept.title || "AI Video",
                style: concept.style || "cyberpunk"
            }
        };
        
        console.log("Generated video content:", content); // Debug log
        return content;
    } catch (error) {
        console.error("Error generating video content:", error);
        return generateFallbackContent();
    }
}

async function fetchWebsimMetadata() {
    try {
        // Fetch current active project metadata
        const currentProject = await window.websim.getCurrentProject();
        
        if (currentProject) {
            return {
                title: currentProject.title,
                description: currentProject.description,
                tags: [], // Project doesn't include tags in the API
                category: 'active-project'
            };
        }
        
        // If no current project, try to get creator info as fallback
        const creator = await window.websim.getCreator();
        if (creator) {
            return {
                title: `${creator.username}'s Creative Space`,
                description: "Exploring creativity with AI and code",
                tags: ["creator", "ai", "websim"],
                category: 'creator'
            };
        }
    } catch (error) {
        console.log("Could not fetch current project data, using fallback:", error);
    }
    
    // Fallback data
    return {
        title: "AI Creative Exploration",
        description: "Discovering new frontiers in digital creativity",
        tags: ["ai", "creative", "digital"],
        category: "technology"
    };
}

async function generateAIConcept(websimData) {
    try {
        const prompt = `Create a short video concept based on this Websim project:
Title: ${websimData.title}
Description: ${websimData.description}
Category: ${websimData.category}

Generate a JSON response with:
- title: catchy video title (max 50 chars)
- description: brief description (max 100 chars)  
- tags: array of 3-5 relevant hashtags
- visualConcept: description of visual elements
- colors: array of 2-3 hex colors for the theme
- animation: animation style (smooth, bouncy, dramatic, etc)
- text: main text to display in video
- style: visual style (minimal, cyberpunk, retro, etc)`;

        const completion = await websim.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: prompt
                },
                {
                    role: "user", 
                    content: "Generate a creative video concept"
                }
            ],
            json: true
        });

        return JSON.parse(completion.content);
    } catch (error) {
        console.error("AI concept generation failed:", error);
        return generateRandomConcept(websimData);
    }
}

function generateRandomConcept(websimData) {
    const concepts = [
        {
            title: "Digital Dreams",
            description: "Exploring the intersection of AI and creativity",
            tags: ["ai", "creativity", "digital", "future"],
            visualConcept: "Flowing particles forming geometric shapes",
            colors: ["#00ffff", "#ff00ff", "#ffffff"],
            animation: "smooth",
            text: websimData.title,
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
            text: websimData.title,
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