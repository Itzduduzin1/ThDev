const API_URL = "https://thdev-f43k.onrender.com";


async function loadProjects() {

    const container =
        document.querySelector("#projects");

    const count =
        document.querySelector("#project-count");


    try {

        const response = await fetch(
            `${API_URL}/api/projects`,
            {
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Não foi possível carregar os projetos."
            );

        }


        const data =
            await response.json();


        const projects =
            Array.isArray(data.projects)
                ? data.projects
                : [];


        count.textContent =
            `${projects.length} PROJETO${projects.length === 1 ? "" : "S"}`;


        if (projects.length === 0) {

            container.innerHTML = `
                <div class="empty">
                    Nenhum projeto publicado.
                </div>
            `;

            return;
        }


        container.innerHTML =
            projects.map(project => {

                return `

                    <article class="project">

                        <img
                            class="project-image"
                            src="${escapeAttribute(project.image)}"
                            alt="${escapeAttribute(project.title)}"
                            loading="lazy"
                            onerror="this.style.opacity='.2'"
                        >

                        <div class="project-info">

                            <div class="project-type">
                                ${escapeHTML(project.type)}
                            </div>

                            <h3 class="project-title">
                                ${escapeHTML(project.title)}
                            </h3>

                            <p class="project-description">
                                ${escapeHTML(project.description)}
                            </p>

                        </div>

                    </article>

                `;

            }).join("");


    } catch (error) {

        console.error(
            "Erro ao carregar projetos:",
            error
        );


        container.innerHTML = `
            <div class="empty">
                Não foi possível carregar os projetos.
            </div>
        `;

    }

}


/* =========================
   SEGURANÇA / HTML
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
   ANO
========================= */

document.querySelector("#year").textContent =
    new Date().getFullYear();


/* =========================
   CARREGAR PROJETOS
========================= */

loadProjects();