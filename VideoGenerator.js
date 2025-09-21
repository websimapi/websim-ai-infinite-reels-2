// AI-powered video content generator using Websim metadata
export async function generateVideoContent() {
    try {
        // Fetch trending Websim content for inspiration
        const websimData = await fetchWebsimMetadata();
        
        // Generate AI video concept based on metadata
        const concept = await generateAIConcept(websimData);
        
        // Create video configuration
        return {
            title: concept.title,
            description: concept.description,
            tags: concept.tags,
            durationInFrames: 180, // 6 seconds at 30fps
            inputProps: {
                concept: concept.visualConcept,
                colors: concept.colors,
                animation: concept.animation,
                text: concept.text,
                style: concept.style
            }
        };
    } catch (error) {
        console.error("Error generating video content:", error);
        return generateFallbackContent();
    }
}

async function fetchWebsimMetadata() {
    try {
        // Fetch trending sites
        const response = await fetch('/api/v1/sites/trending');
        const data = await response.json();
        
        if (data.sites && data.sites.length > 0) {
            const randomSite = data.sites[Math.floor(Math.random() * data.sites.length)];
            return {
                title: randomSite.title,
                description: randomSite.description,
                tags: randomSite.tags || [],
                category: randomSite.category || 'general'
            };
        }
    } catch (error) {
        console.log("Could not fetch Websim data, using fallback");
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
            colors: ["#00ffff", "#ff00ff"],
            animation: "smooth",
            text: "AI Creativity",
            style: "minimal"
        }
    };
}

