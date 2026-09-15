const API_URL = "https://thdev-f43k.onrender.com";

let token = sessionStorage.getItem("thdev_token");

const loginSection = document.querySelector("#login-section");
const adminPanel = document.querySelector("#admin-panel");

const loginForm = document.querySelector("#login-form");
const passwordInput = document.querySelector("#password");
const loginError = document.querySelector("#login-error");

const projectForm = document.querySelector("#project-form");
const projectList = document.querySelector("#project-list");
const projectCount = document.querySelector("#project-count");
const formMessage = document.querySelector("#form-message");

const logoutButton = document.querySelector("#logout-button");


/* =========================
   API
========================= */

async function api(endpoint, options = {}) {

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    );

    let data = {};

    try {
        data = await response.json();
    } catch {
        data = {};
    }

    if (!response.ok) {

        if (response.status === 401) {
            logout(false);
        }

        throw new Error(
            data.error || "Erro na API."
        );
    }

    return data;
}


/* =========================
   LOGIN
========================= */

loginForm.addEventListener("submit", async event => {

    event.preventDefault();

    loginError.textContent = "";

    const password = passwordInput.value;

    if (!password) {
        loginError.textContent = "Digite sua senha.";
        return;
    }

    try {

        const data = await api(
            "/api/login",
            {
                method: "POST",

                body: JSON.stringify({
                    password
                })
            }
        );

        token = data.token;

        sessionStorage.setItem(
            "thdev_token",
            token
        );

        passwordInput.value = "";

        showAdmin();

    } catch (error) {

        loginError.textContent =
            error.message;

    }

});


/* =========================
   LOGIN / ADMIN
========================= */

function showLogin() {

    loginSection.classList.remove("hidden");

    adminPanel.classList.add("hidden");

}


async function showAdmin() {

    loginSection.classList.add("hidden");

    adminPanel.classList.remove("hidden");

    await loadProjects();

}


/* =========================
   LOGOUT
========================= */

async function logout(callApi = true) {

    if (callApi && token) {

        try {

            await api(
                "/api/logout",
                {
                    method: "POST"
                }
            );

        } catch {}

    }

    token = null;

    sessionStorage.removeItem(
        "thdev_token"
    );

    showLogin();

}


logoutButton.addEventListener(
    "click",
    () => logout(true)
);


/* =========================
   CARREGAR PROJETOS
========================= */

async function loadProjects() {

    try {

        const data =
            await api("/api/projects");

        const projects =
            Array.isArray(data.projects)
                ? data.projects
                : [];


        projectCount.textContent =
            `${projects.length} projeto${projects.length === 1 ? "" : "s"}`;


        if (!projects.length) {

            projectList.innerHTML = `
                <div class="muted">
                    Nenhum projeto.
                </div>
            `;

            return;
        }


        projectList.innerHTML =
            projects.map(project => `

                <article class="project-item">

                    <div class="project-main">

                        <img
                            class="project-thumb"
                            src="${escapeAttribute(project.image)}"
                            alt=""
                        >

                        <div>

                            <div class="project-name">
                                ${escapeHTML(project.title)}
                            </div>

                            <div class="project-type">
                                ${escapeHTML(project.type)}
                            </div>

                        </div>

                    </div>


                    <button
                        class="delete"
                        data-id="${escapeAttribute(project.id)}"
                    >
                        Excluir
                    </button>

                </article>

            `).join("");


        document
            .querySelectorAll(".delete")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {
                        deleteProject(
                            button.dataset.id
                        );
                    }
                );

            });


    } catch (error) {

        projectList.innerHTML = `
            <div class="muted">
                ${escapeHTML(error.message)}
            </div>
        `;

    }

}


/* =========================
   ADICIONAR
========================= */

projectForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        formMessage.textContent =
            "Salvando...";


        const project = {

            title:
                document
                    .querySelector("#title")
                    .value
                    .trim(),

            type:
                document
                    .querySelector("#type")
                    .value
                    .trim(),

            image:
                document
                    .querySelector("#image")
                    .value
                    .trim(),

            description:
                document
                    .querySelector("#description")
                    .value
                    .trim()

        };


        try {

            await api(
                "/api/projects",
                {
                    method: "POST",

                    body:
                        JSON.stringify(project)
                }
            );


            projectForm.reset();

            formMessage.textContent =
                "Projeto adicionado com sucesso.";

            await loadProjects();


        } catch (error) {

            formMessage.textContent =
                error.message;

        }

    }
);


/* =========================
   EXCLUIR
========================= */

async function deleteProject(id) {

    if (!confirm(
        "Deseja realmente excluir este projeto?"
    )) {
        return;
    }


    try {

        await api(
            `/api/projects/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );


        await loadProjects();


    } catch (error) {

        alert(error.message);

    }

}


/* =========================
   ESCAPES
========================= */

function escapeHTML(value = "") {

    return String(value).replace(
        /[&<>"']/g,

        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );

}


function escapeAttribute(value = "") {

    return escapeHTML(value);

}


/* =========================
   INICIAR
========================= */

if (token) {

    api("/api/projects")
        .then(() => {
            showAdmin();
        })
        .catch(() => {
            showLogin();
        });

} else {

    showLogin();

}