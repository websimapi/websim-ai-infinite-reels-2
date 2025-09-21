const API_BASE = 'https://api.websim.com/api/v1';

async function makeRequest(endpoint, options = {}) {
    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    });
    
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    
    // Handle cases where response might not have a JSON body
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        return response.json();
    } else {
        return response.text();
    }
}

export function getProjectById(projectId) {
    return makeRequest(`/projects/${projectId}`);
}

export function getProjectBySlug(username, slug) {
    return makeRequest(`/users/${username}/slugs/${slug}`);
}

export function getProjectRevisions(projectId, params = {}) {
    const query = new URLSearchParams(params).toString();
    return makeRequest(`/projects/${projectId}/revisions?${query}`);
}

export async function getAllProjectRevisions(projectId) {
    let allRevisions = [];
    let hasNextPage = true;
    let afterCursor = null;

    while (hasNextPage) {
        const params = { first: 100 }; // Fetch 100 at a time
        if (afterCursor) {
            params.after = afterCursor;
        }

        const response = await getProjectRevisions(projectId, params);
        
        if (response.revisions && response.revisions.data) {
            allRevisions = allRevisions.concat(response.revisions.data);
        }
        
        hasNextPage = response.revisions?.meta?.has_next_page || false;
        afterCursor = response.revisions?.meta?.end_cursor;

        // Safety break if there's no cursor to advance or if we have enough data
        if (!afterCursor || allRevisions.length >= 200) {
            hasNextPage = false;
        }
    }

    return allRevisions;
}

export function getProjectRevision(projectId, version) {
    return makeRequest(`/projects/${projectId}/revisions/${version}`);
}

export function getAssets(projectId, version) {
    return makeRequest(`/projects/${projectId}/revisions/${version}/assets`);
}

export async function getUser(username) {
    return makeRequest(`/users/${username}`);
}