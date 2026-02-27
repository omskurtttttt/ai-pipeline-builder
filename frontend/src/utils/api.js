const API_BASE = 'http://localhost:8000/api'

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: { 'Content-Type': 'application/json', ...options.headers },
        ...options,
    })
    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: res.statusText }))
        throw new Error(error.detail || 'Request failed')
    }
    return res.json()
}

/* ─── Pipeline CRUD ─── */

export async function savePipeline(name, nodes, edges, description = '') {
    return request('/pipelines', {
        method: 'POST',
        body: JSON.stringify({ name, description, nodes, edges }),
    })
}

export async function updatePipeline(id, data) {
    return request(`/pipelines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    })
}

export async function loadPipeline(id) {
    return request(`/pipelines/${id}`)
}

export async function listPipelines() {
    return request('/pipelines')
}

export async function deletePipeline(id) {
    return request(`/pipelines/${id}`, { method: 'DELETE' })
}

/* ─── Execution ─── */

export async function executePipeline(nodes, edges) {
    return request('/execute', {
        method: 'POST',
        body: JSON.stringify({ nodes, edges }),
    })
}

export async function executeSavedPipeline(id) {
    return request(`/execute/${id}`, { method: 'POST' })
}

/* ─── LLM Providers ─── */

export async function getProviders() {
    return request('/llm/providers')
}

/* ─── Health ─── */
export async function checkHealth() {
    return request('/health')
}
