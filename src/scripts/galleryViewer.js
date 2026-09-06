(function () {
    let cleanupFn = null;

    document.addEventListener("astro:page-load", () => {
        if (cleanupFn) {
            cleanupFn();
            cleanupFn = null;
        }

        const modal = document.getElementById("gallery-modal");
        if (!modal) return;

        const tabs = document.querySelectorAll(".gallery-tab");
        const allItems = Array.from(
            document.querySelectorAll(".gallery-item"),
        );
        const modalImage = document.getElementById("modal-image");
        // Footer elements
        const modalTitleMobile =
            document.getElementById("modal-title-mobile");
        const modalCounterMobile =
            document.getElementById("modal-counter-mobile");
        const modalDateMobile =
            document.getElementById("modal-date-mobile");
        const modalLocationMobile =
            document.getElementById("modal-location-mobile");
        const modalExifMobile =
            document.getElementById("modal-exif-mobile");
        const modalFilmMobile =
            document.getElementById("modal-film-mobile");
        const modalCameraMobile =
            document.getElementById("modal-camera-mobile");
        const modalLensMobile =
            document.getElementById("modal-lens-mobile");
        const modalBodyMobile =
            document.getElementById("modal-body-mobile");
        const modalFooterMeta =
            document.querySelector(".modal-footer-meta");
        // Shared elements
        const modalContent =
            document.getElementById("modal-content");
        const backdrop = document.getElementById("modal-backdrop");
        const closeBtn = document.getElementById("modal-close");
        const prevZone = document.getElementById("modal-prev-zone");
        const nextZone = document.getElementById("modal-next-zone");
        const modalScroll =
            document.getElementById("modal-scroll");
        const lightbox = document.getElementById("lightbox");

        let currentIndex = -1;
        let currentFrameIndex = 0;
        let currentMeta = null;
        let visibleItems = allItems;
        let lastFocused = null;
        let imageRequestId = 0;
        const preloadedImages = new Set();

        function getVisibleItems() {
            return Array.from(document.querySelectorAll(".gallery-item")).filter(
                (el) => el.style.display !== "none",
            );
        }

        function readItemMeta(el) {
            const id = el?.dataset?.metaId;
            const script = id ? document.getElementById(id) : null;
            if (!script) return null;
            return JSON.parse(script.textContent || "{}");
        }

        function setModalImage(src, alt) {
            const requestId = ++imageRequestId;
            modalImage.onload = null;
            modalImage.style.opacity = "0";

            if (!src) {
                modalImage.removeAttribute("src");
                modalImage.alt = "";
                return;
            }

            const loader = new Image();
            loader.decoding = "async";
            let ready;
            if (loader.decode) {
                loader.src = src;
                ready = loader.decode().catch(function () {});
            } else {
                ready = new Promise(function (resolve) {
                    loader.onload = resolve;
                    loader.onerror = resolve;
                });
                loader.src = src;
            }

            ready.then(function () {
                if (requestId !== imageRequestId) return;
                modalImage.src = src;
                modalImage.alt = alt;
                window.requestAnimationFrame(function () {
                    if (requestId === imageRequestId) {
                        modalImage.style.opacity = "1";
                    }
                });
            });
        }

        function openModal(index, frameIndex = 0) {
            visibleItems = getVisibleItems();
            if (index < 0 || index >= visibleItems.length) return;
            currentIndex = index;
            const el = visibleItems[index];
            const meta = readItemMeta(el);
            if (!meta) return;
            const images = Array.isArray(meta.images) && meta.images.length
                ? meta.images
                : [meta.image];
            currentFrameIndex = Math.max(
                0,
                Math.min(frameIndex, images.length - 1),
            );
            currentMeta = meta;
            const bodyEl = el.querySelector(".gallery-body");
            const bodyHTML = bodyEl
                ? bodyEl.innerHTML.trim()
                : "";

            const imageSrc = images[currentFrameIndex];
            const imageAlt = images.length > 1
                ? `${meta.title} (${currentFrameIndex + 1}/${images.length})`
                : meta.title;
            setModalImage(imageSrc, imageAlt);

            const itemCounter =
                currentIndex + 1 + " / " + visibleItems.length;
            const counterText = images.length > 1
                ? itemCounter + " · frame " + (currentFrameIndex + 1) + " / " + images.length
                : itemCounter;

            // Footer info
            modalTitleMobile.textContent = meta.title;
            modalCounterMobile.textContent = counterText;
            modalDateMobile.textContent = meta.date || "";
            modalDateMobile.style.display = meta.date
                ? ""
                : "none";
            modalLocationMobile.textContent =
                meta.location || "";
            modalLocationMobile.style.display = meta.location
                ? ""
                : "none";
            modalExifMobile.textContent = meta.exif || "";
            modalExifMobile.style.display = meta.exif
                ? ""
                : "none";
            modalCameraMobile.textContent = meta.camera || "";
            modalCameraMobile.style.display = meta.camera
                ? ""
                : "none";
            modalLensMobile.textContent = meta.lens || "";
            modalLensMobile.style.display = meta.lens
                ? ""
                : "none";
            modalFilmMobile.textContent = meta.filmStock || "";
            modalFilmMobile.style.display = meta.filmStock
                ? ""
                : "none";
            modalBodyMobile.innerHTML = bodyHTML;
            modalBodyMobile.style.display = bodyHTML
                ? ""
                : "none";
            if (modalFooterMeta) modalFooterMeta.scrollLeft = 0;

            const hasPrev = currentIndex > 0 || currentFrameIndex > 0;
            const hasNext =
                currentFrameIndex < images.length - 1 ||
                currentIndex < visibleItems.length - 1;
            prevZone.disabled = !hasPrev;
            nextZone.disabled = !hasNext;

            // Show with animation
            modal.classList.remove("pointer-events-none");
            modal.style.opacity = "1";
            document.body.style.overflow = "hidden";
            modalScroll.scrollTop = 0;
            schedulePreloadAroundCurrent();
        }

        function closeModal() {
            modal.style.opacity = "0";
            modal.classList.add("pointer-events-none");
            document.body.style.overflow = "";
            currentIndex = -1;
            currentFrameIndex = 0;
            currentMeta = null;
            imageRequestId += 1;
            // Restore focus to the card that opened the modal
            if (lastFocused && lastFocused.isConnected) {
                lastFocused.focus();
            }
            lastFocused = null;
        }

        function closeLightbox() {
            lightbox.classList.add(
                "opacity-0",
                "pointer-events-none",
            );
        }

        lightbox.addEventListener("click", closeLightbox);

        function getItemMeta(index) {
            const el = visibleItems[index];
            return el ? readItemMeta(el) : null;
        }

        function getMetaImages(meta) {
            return Array.isArray(meta?.images) && meta.images.length
                ? meta.images
                : meta?.image
                    ? [meta.image]
                    : [];
        }

        function preloadImage(src) {
            if (
                !src ||
                preloadedImages.has(src) ||
                src === modalImage.getAttribute("src")
            ) {
                return;
            }
            preloadedImages.add(src);
            const image = new Image();
            image.decoding = "async";
            image.src = src;
        }

        function getAdjacentImage(dir) {
            const images = getMetaImages(currentMeta);
            if (dir > 0 && currentFrameIndex < images.length - 1) {
                return images[currentFrameIndex + 1];
            }
            if (dir < 0 && currentFrameIndex > 0) {
                return images[currentFrameIndex - 1];
            }

            const next = currentIndex + dir;
            if (next < 0 || next >= visibleItems.length) return null;

            const nextImages = getMetaImages(getItemMeta(next));
            if (!nextImages.length) return null;
            return dir < 0 ? nextImages[nextImages.length - 1] : nextImages[0];
        }

        function preloadAroundCurrent() {
            preloadImage(getAdjacentImage(-1));
            preloadImage(getAdjacentImage(1));
        }

        function schedulePreloadAroundCurrent() {
            if ("requestIdleCallback" in window) {
                window.requestIdleCallback(preloadAroundCurrent, {
                    timeout: 700,
                });
            } else {
                window.setTimeout(preloadAroundCurrent, 120);
            }
        }

        function navigate(dir) {
            visibleItems = getVisibleItems();
            const images = getMetaImages(currentMeta);

            if (dir > 0 && currentFrameIndex < images.length - 1) {
                openModal(currentIndex, currentFrameIndex + 1);
                return;
            }
            if (dir < 0 && currentFrameIndex > 0) {
                openModal(currentIndex, currentFrameIndex - 1);
                return;
            }

            const next = currentIndex + dir;
            if (next >= 0 && next < visibleItems.length) {
                const nextImages = getMetaImages(getItemMeta(next));
                openModal(
                    next,
                    dir < 0 ? Math.max(0, nextImages.length - 1) : 0,
                );
            }
        }

        // Card click / keyboard → open modal
        function onItemClick(e) {
            e.preventDefault();
            const el = e.currentTarget;
            visibleItems = getVisibleItems();
            const idx = visibleItems.indexOf(el);
            if (idx !== -1) {
                lastFocused = el;
                openModal(idx);
                if (closeBtn) closeBtn.focus();
            }
        }
        function onItemKeydown(e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onItemClick(e);
            }
        }

        allItems.forEach(function (item) {
            item.addEventListener("click", onItemClick);
            item.addEventListener("keydown", onItemKeydown);
        });

        // Close: backdrop click (but not modal-content click)
        modalScroll.addEventListener("click", function (e) {
            if (e.target === modalScroll || e.target === backdrop) {
                closeModal();
            }
        });
        closeBtn.addEventListener("click", closeModal);

        // Large hit zones over the image area
        prevZone.addEventListener("click", function (e) {
            e.stopPropagation();
            e.currentTarget.blur();
            navigate(-1);
        });
        nextZone.addEventListener("click", function (e) {
            e.stopPropagation();
            e.currentTarget.blur();
            navigate(1);
        });

        // Touch swipe on modal content area
        let touchStartX = 0;
        let touchStartY = 0;
        function onTouchStart(e) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        }
        function onTouchEnd(e) {
            const dx =
                e.changedTouches[0].clientX - touchStartX;
            const dy =
                e.changedTouches[0].clientY - touchStartY;
            if (
                Math.abs(dx) > 50 &&
                Math.abs(dx) > Math.abs(dy) * 1.5
            ) {
                navigate(dx > 0 ? -1 : 1);
            }
        }
        modalContent.addEventListener(
            "touchstart",
            onTouchStart,
            { passive: true },
        );
        modalContent.addEventListener("touchend", onTouchEnd);

        // Keyboard
        function isLightboxOpen() {
            return !lightbox.classList.contains(
                "pointer-events-none",
            );
        }

        function getModalFocusables() {
            const sel =
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            return Array.from(modal.querySelectorAll(sel)).filter(
                function (el) {
                    return !el.disabled && el.getClientRects().length > 0;
                },
            );
        }

        function onKeydown(e) {
            if (isLightboxOpen()) {
                if (e.key === "Escape") closeLightbox();
                return;
            }
            if (currentIndex === -1) return;
            if (e.key === "Escape") closeModal();
            if (e.key === "ArrowLeft") navigate(-1);
            if (e.key === "ArrowRight") navigate(1);
            if (e.key === "Tab") {
                const f = getModalFocusables();
                if (f.length === 0) return;
                const first = f[0];
                const last = f[f.length - 1];
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (
                    !e.shiftKey &&
                    document.activeElement === last
                ) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }
        document.addEventListener("keydown", onKeydown);

        function onTabClick(event) {
            const tab = event.currentTarget;
            const filter = tab.dataset.filter;
            tabs.forEach(function (t) {
                t.classList.remove("active");
                t.setAttribute("aria-pressed", "false");
            });
            tab.classList.add("active");
            tab.setAttribute("aria-pressed", "true");

            allItems.forEach(function (item) {
                if (filter === "all") {
                    item.style.display = "";
                } else if (filter === "featured") {
                    item.style.display =
                        item.dataset.featured === "true" ? "" : "none";
                } else {
                    item.style.display =
                        item.dataset.category === filter ? "" : "none";
                }
            });
        }

        // Tab filter
        tabs.forEach(function (tab) {
            tab.addEventListener("click", onTabClick);
        });

        // Cleanup
        cleanupFn = function () {
            allItems.forEach(function (item) {
                item.removeEventListener("click", onItemClick);
                item.removeEventListener("keydown", onItemKeydown);
            });
            document.removeEventListener("keydown", onKeydown);
            tabs.forEach(function (tab) {
                tab.removeEventListener("click", onTabClick);
            });
            modalContent.removeEventListener(
                "touchstart",
                onTouchStart,
            );
            modalContent.removeEventListener(
                "touchend",
                onTouchEnd,
            );
            closeModal();
        };
    });
})();
