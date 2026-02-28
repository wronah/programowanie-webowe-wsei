import "./style.css";
import type { Project } from "./types";
import {
  fetchProjectsMock,
  createProjectMock,
  updateProjectMock,
  deleteProjectMock,
  fetchProjectByIdMock,
} from "./api";

const app = document.getElementById("app") as HTMLDivElement;
if (!app) throw new Error("#app element not found");

app.innerHTML = `
  <h1>Projects API - Mock Showcase</h1>
  <label for="actionSelect">Select action:</label>
  <select id="actionSelect">
    <option value="create">create</option>
    <option value="read">read</option>
    <option value="update">update</option>
    <option value="delete">delete</option>
    <option value="readById">read by id</option>
  </select>
  <div id="controls" style="margin-top:1rem"></div>
  <div id="result" style="margin-top:1rem"></div>
`;

const actionSelect = document.getElementById("actionSelect") as HTMLSelectElement;
const controls = document.getElementById("controls") as HTMLDivElement;
const result = document.getElementById("result") as HTMLDivElement;

actionSelect.addEventListener("change", () => renderControls(actionSelect.value));

renderControls(actionSelect.value);

function clearNode(node: HTMLElement) {
  node.innerHTML = "";
}

function showMessage(msg: string, isError = false) {
  result.innerHTML = `<div style="padding:0.5rem;border:1px solid ${isError ? "#c00" : "#0a0"};background:${isError ? "#fee" : "#efe"}">${escapeHtml(msg)}</div>`;
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function renderControls(action: string) {
  clearNode(controls);
  clearNode(result);

  if (action === "create") {
    const form = document.createElement("form");
    form.innerHTML = `
      <div>
        <label>Project name: <input name="name" required /></label>
      </div>
      <div>
        <label>Description: <input name="description" /></label>
      </div>
      <div style="margin-top:0.5rem">
        <button type="submit">Create</button>
      </div>
    `;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const description = String(formData.get("description") || "").trim();
      try {
        const created = await createProjectMock({ name, description });
        showMessage(`Created project: ${created.id} - ${escapeHtml(created.name)}`);
      } catch (err: any) {
        showMessage(String(err?.message || err), true);
      }
    });
    controls.appendChild(form);
  }

  if (action === "read") {
    const refreshBtn = document.createElement("button");
    refreshBtn.textContent = "Refresh list";
    refreshBtn.addEventListener("click", async () => {
      await loadAndShowAllProjects();
    });
    controls.appendChild(refreshBtn);
    await loadAndShowAllProjects();
  }

  if (action === "update") {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div>
        <label>Select project: <select id="updateSelect"></select></label>
      </div>
      <form id="updateForm" style="margin-top:0.5rem">
        <div><label>Name: <input name="name" required /></label></div>
        <div><label>Description: <input name="description" /></label></div>
        <div style="margin-top:0.5rem"><button type="submit">Update</button></div>
      </form>
    `;
    controls.appendChild(wrapper);

    const sel = wrapper.querySelector("#updateSelect") as HTMLSelectElement;
    const form = wrapper.querySelector("#updateForm") as HTMLFormElement;

    const load = async () => {
      try {
        const projects = await fetchProjectsMock();
        sel.innerHTML = projects.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("");
        if (projects.length > 0) fillFormWithProject(projects[0], form);
      } catch (err: any) {
        showMessage(String(err?.message || err), true);
      }
    };

    sel.addEventListener("change", async () => {
      const id = sel.value;
      try {
        const p = await fetchProjectByIdMock(id);
        fillFormWithProject(p, form);
      } catch (err: any) {
        showMessage(String(err?.message || err), true);
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = sel.value;
      const fd = new FormData(form);
      const name = String(fd.get("name") || "").trim();
      const description = String(fd.get("description") || "").trim();
      try {
        const updated: Project = await updateProjectMock({ id, name, description });
        showMessage(`Updated project: ${updated.id} - ${escapeHtml(updated.name)}`);
        await load();
      } catch (err: any) {
        showMessage(String(err?.message || err), true);
      }
    });

    await load();
  }

  if (action === "delete") {
    const form = document.createElement("form");
    form.innerHTML = `
      <div>
        <label>Project id to delete: <input name="id" required /></label>
      </div>
      <div style="margin-top:0.5rem"><button type="submit">Delete</button></div>
    `;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const id = String(fd.get("id") || "").trim();
      try {
        await deleteProjectMock(id);
        showMessage(`Deleted project ${escapeHtml(id)}`);
      } catch (err: any) {
        showMessage(String(err?.message || err), true);
      }
    });
    controls.appendChild(form);
  }

  if (action === "readById") {
    const form = document.createElement("form");
    form.innerHTML = `
      <div>
        <label>Project id: <input name="id" required /></label>
      </div>
      <div style="margin-top:0.5rem"><button type="submit">Fetch</button></div>
    `;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const id = String(fd.get("id") || "").trim();
      try {
        const p = await fetchProjectByIdMock(id);
        result.innerHTML = renderProjectDetails(p);
      } catch (err: any) {
        showMessage(String(err?.message || err), true);
      }
    });
    controls.appendChild(form);
  }
}

async function loadAndShowAllProjects() {
  try {
    const projects = await fetchProjectsMock();
    if (projects.length === 0) {
      showMessage("No projects found.");
      return;
    }
    result.innerHTML = `
      <ul>
        ${projects
          .map((p) => `<li><strong>${escapeHtml(p.name)}</strong> (${p.id})<div>${escapeHtml(p.description)}</div></li>`)
          .join("")}
      </ul>
    `;
  } catch (err: any) {
    showMessage(String(err?.message || err), true);
  }
}

function fillFormWithProject(p: Project, form: HTMLFormElement) {
  const name = form.querySelector("input[name=\"name\"]") as HTMLInputElement | null;
  const desc = form.querySelector("input[name=\"description\"]") as HTMLInputElement | null;
  if (name) name.value = p.name;
  if (desc) desc.value = p.description;
}

function renderProjectDetails(p: Project) {
  return `
    <div style="border:1px solid #ccc;padding:0.5rem">
      <div><strong>id:</strong> ${p.id}</div>
      <div><strong>name:</strong> ${escapeHtml(p.name)}</div>
      <div><strong>description:</strong> ${escapeHtml(p.description)}</div>
    </div>
  `;
}