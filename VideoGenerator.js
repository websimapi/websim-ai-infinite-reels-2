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
        // First try to get current user for API calls
        const user = await window.websim.getUser();
        
        if (user) {
            // Fetch user's following to get recent projects
            const response = await fetch(`/api/v1/users/${user.username}/following`);
            const followingData = await response.json();
            
            if (followingData.following && followingData.following.data.length > 0) {
                // Get a random followed user's projects
                const randomFollow = followingData.following.data[Math.floor(Math.random() * followingData.following.data.length)];
                const followedUser = randomFollow.follow;
                
                // Fetch that user's projects
                const projectsResponse = await fetch(`/api/v1/users/${followedUser.username}/projects`);
                const projectsData = await projectsResponse.json();
                
                if (projectsData.projects && projectsData.projects.data.length > 0) {
                    const randomProject = projectsData.projects.data[Math.floor(Math.random() * projectsData.projects.data.length)];
                    
                    return {
                        title: randomProject.title,
                        description: randomProject.description,
                        creator: {
                            username: followedUser.username,
                            avatar_url: followedUser.avatar_url,
                            id: followedUser.id
                        },
                        projectId: randomProject.id,
                        category: 'websim-project'
                    };
                }
            }
        }
        
        // Fallback: try to get current project
        const currentProject = await window.websim.getCurrentProject();
        const creator = await window.websim.getCreator();
        
        if (currentProject && creator) {
            return {
                title: currentProject.title,
                description: currentProject.description,
                creator: creator,
                projectId: currentProject.id,
                category: 'current-project'
            };
        }
        
    } catch (error) {
        console.log("Could not fetch project data, using fallback:", error);
    }
    
    // Ultimate fallback
    return {
        title: "AI Creative Exploration",
        description: "Discovering new frontiers in digital creativity",
        creator: {
            username: "websim",
            avatar_url: null,
            id: "websim"
        },
        category: "technology"
    };
}

async function generateAIConcept(projectData) {
    try {
        const prompt = `Create a short video concept based on this Websim project:
Title: ${projectData.title}
Description: ${projectData.description}
Creator: ${projectData.creator.username}
Category: ${projectData.category}

Generate a JSON response with:
- title: catchy video title referencing the project (max 50 chars)
- description: brief description about the project (max 100 chars)  
- tags: array of 3-5 relevant hashtags related to the project
- visualConcept: description of visual elements inspired by the project
- colors: array of 2-3 hex colors that match the project theme
- animation: animation style (smooth, bouncy, dramatic, etc)
- text: main text to display in video (project title or related)
- style: visual style (minimal, cyberpunk, retro, etc) that fits the project`;

        const completion = await window.websim.chatCompletion({
            messages: [
                {
                    role: "user",
                    content: [{
                        type: "text",
                        text: prompt
                    }]
                }
            ],
            json: true
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