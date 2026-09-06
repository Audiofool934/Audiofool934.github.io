type SortOrder = "newest" | "oldest" | "location" | "shuffle";

let cleanup = () => {};

function initGallerySort() {
    cleanup();
    const controls = document.getElementById("gallery-sort-controls");
    const grid = document.querySelector<HTMLElement>(".gallery-masonry");
    if (!controls || !grid) return;

    const buttons = Array.from(controls.querySelectorAll<HTMLButtonElement>("[data-sort]"));
    const status = document.getElementById("gallery-sort-status");
    const collator = new Intl.Collator("en", { sensitivity: "base", numeric: true });
    const items = Array.from(grid.querySelectorAll<HTMLElement>(".gallery-item")).map((element) => {
        const meta = JSON.parse(document.getElementById(element.dataset.metaId!)!.textContent || "{}");
        return { element, date: Date.parse(meta.date) || 0, location: (meta.location || "").trim() };
    });
    const controller = new AbortController();
    let shuffleCount = 0;

    function applySort(order: SortOrder, announce = true) {
        const ordered = [...items];
        if (order === "shuffle") {
            for (let i = ordered.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
            }
            shuffleCount++;
        } else {
            ordered.sort((a, b) => {
                if (order === "oldest") return a.date - b.date;
                if (order === "location") {
                    // Keep unnamed locations last and each place together.
                    const byLocation = Number(!a.location) - Number(!b.location)
                        || collator.compare(a.location, b.location);
                    if (byLocation) return byLocation;
                }
                return b.date - a.date;
            });
        }

        // DOM order also controls keyboard traversal and the photo viewer.
        grid!.append(...ordered.map(({ element }) => element));
        buttons.forEach((button) => {
            button.setAttribute("aria-pressed", String(button.dataset.sort === order));
        });
        if (announce && status) {
            const descriptions = {
                newest: "Sorted by date, newest first.",
                oldest: "Sorted by date, oldest first.",
                location: "Sorted by location A to Z, newest first within each place.",
                shuffle: `Photos shuffled. Shuffle ${shuffleCount}.`,
            };
            status.textContent = descriptions[order];
        }
    }

    buttons.forEach((button) => {
        button.addEventListener("click", () => applySort(button.dataset.sort as SortOrder), {
            signal: controller.signal,
        });
    });
    applySort("newest", false);
    controls.hidden = false;
    cleanup = () => controller.abort();
}

document.addEventListener("astro:page-load", initGallerySort);
