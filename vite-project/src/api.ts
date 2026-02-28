import type { Project } from "./types";

export async function fetchProjects(): Promise<Project[]> {
    const response = await fetch("/api/projects");
    if (!response.ok) {
        throw new Error("Failed to fetch projects");
    }
    return response.json();
}

export async function createProject(project: Omit<Project, "id">): Promise<Project> {
    const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(project)
    });
    if (!response.ok) {
        throw new Error("Failed to create project");
    }
    return response.json();
}

export async function deleteProject(projectId: string): Promise<void> {
    const response = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE"
    });
    if (!response.ok) {
        throw new Error("Failed to delete project");
    }
}

export async function updateProject(project: Project): Promise<Project> {
    const response = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(project)
    });
    if (!response.ok) {
        throw new Error("Failed to update project");
    }
    return response.json();
}

export async function fetchProjectById(projectId: string): Promise<Project> {
    const response = await fetch(`/api/projects/${projectId}`);
    if (!response.ok) {
        throw new Error("Failed to fetch project");
    }
    return response.json();
}

// LocalStorage backend mock
const MOCK_STORAGE_KEY = "projects_v1_mock";

export async function fetchProjectsMock(): Promise<Project[]> {
    await mockPause();
    return mockReadProjects();
}

export async function createProjectMock(project: Omit<Project, "id">): Promise<Project> {
    const projects = mockReadProjects();
    const newProject: Project = { ...project, id: mockGenId() };
    projects.push(newProject);
    mockWriteProjects(projects);
    await mockPause();
    return newProject;
}

export async function deleteProjectMock(projectId: string): Promise<void> {
    const projects = mockReadProjects();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx === -1) {
        throw new Error("Mock delete failed: project not found");
    }
    projects.splice(idx, 1);
    mockWriteProjects(projects);
    await mockPause();
}

export async function updateProjectMock(project: Project): Promise<Project> {
    const projects = mockReadProjects();
    const idx = projects.findIndex((p) => p.id === project.id);
    if (idx === -1) {
        throw new Error("Mock update failed: project not found");
    }
    projects[idx] = project;
    mockWriteProjects(projects);
    await mockPause();
    return project;
}

export async function fetchProjectByIdMock(projectId: string): Promise<Project> {
    await mockPause();
    const projects = mockReadProjects();
    const p = projects.find((x) => x.id === projectId);
    if (!p) {
        throw new Error("Mock fetch failed: project not found");
    }
    return p;
}

function mockReadProjects(): Project[] {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) {
        const seed: Project[] = [
            { id: mockGenId(), name: "Demo Project (mock)", description: "Demo project stored in localStorage (mock)" }
        ];
        localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(seed));
        return seed;
    }
    try {
        return JSON.parse(raw) as Project[];
    } catch {
        return [];
    }
}

function mockWriteProjects(projects: Project[]) {
    localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(projects));
}

function mockGenId(): string {
    return crypto.randomUUID();
}

function mockPause(ms = 120) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}



