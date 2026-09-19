export {};

let cleanup = () => {};

function initGalleryFilters() {
    cleanup();
    const controls = document.getElementById("gallery-filters");
    const grid = document.querySelector<HTMLElement>(".gallery-masonry");
    const status = document.getElementById("gallery-filter-status");
    const empty = document.getElementById("gallery-filter-empty");
    if (!controls || !grid || !status || !empty) return;

    const items = Array.from(grid.querySelectorAll<HTMLElement>(".gallery-item"));
    const views = Array.from(controls.querySelectorAll<HTMLButtonElement>("[data-gallery-view]"));
    const subjects = Array.from(controls.querySelectorAll<HTMLButtonElement>("[data-gallery-subject]"));
    const reset = document.getElementById("gallery-filter-reset") as HTMLButtonElement;
    const controller = new AbortController();
    let featuredOnly = false;
    let subject = "all";

    function applyFilters() {
        const selection = items.filter((item) => !featuredOnly || item.dataset.featured === "true");
        let count = 0;
        items.forEach((item) => {
            const visible = (!featuredOnly || item.dataset.featured === "true")
                && (subject === "all" || item.dataset.category === subject);
            item.style.display = visible ? "" : "none";
            if (visible) count++;
        });

        views.forEach((button) => {
            button.setAttribute("aria-pressed", String((button.dataset.galleryView === "featured") === featuredOnly));
        });
        subjects.forEach((button) => {
            const category = button.dataset.gallerySubject!;
            button.setAttribute("aria-pressed", String(category === subject));
            const countLabel = button.querySelector("[data-subject-count]");
            if (countLabel) {
                countLabel.textContent = String(selection.filter((item) => item.dataset.category === category).length);
            }
        });

        const kind = featuredOnly ? "featured photo" : "photo";
        status!.textContent = `Showing ${count} ${kind}${count === 1 ? "" : "s"}${subject === "all" ? "" : ` in ${subject}`}`;
        empty!.hidden = count !== 0 || items.length === 0;
        empty!.textContent = featuredOnly
            ? `No featured photos in ${subject} yet. Try All photos or another subject.`
            : "No photos in this subject yet. Try another subject.";
        reset.hidden = !featuredOnly && subject === "all";
    }

    views.forEach((button) => button.addEventListener("click", () => {
        featuredOnly = button.dataset.galleryView === "featured";
        applyFilters();
    }, { signal: controller.signal }));
    subjects.forEach((button) => button.addEventListener("click", () => {
        subject = button.dataset.gallerySubject!;
        applyFilters();
    }, { signal: controller.signal }));
    reset.addEventListener("click", () => {
        featuredOnly = false;
        subject = "all";
        applyFilters();
        views[0].focus();
    }, { signal: controller.signal });

    applyFilters();
    controls.hidden = false;
    cleanup = () => controller.abort();
}

document.addEventListener("astro:page-load", initGalleryFilters);
