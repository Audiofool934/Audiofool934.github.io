import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

/** Probe the build filesystem instead of assuming behavior from the OS name. */
export function isCaseSensitiveFilesystem(directory) {
    const probe = mkdtempSync(path.join(directory, ".route-case-"));
    try {
        writeFileSync(path.join(probe, "probe"), "");
        return !existsSync(path.join(probe, "PROBE"));
    } finally {
        rmSync(probe, { recursive: true, force: true });
    }
}

/**
 * Case-only aliases already resolve to the canonical file on an insensitive
 * filesystem. Writing a redirect there would overwrite the actual page.
 * @param {{ from: string, to: string }[]} redirects
 * @param {boolean} caseSensitive
 */
export function redirectsForFilesystem(redirects, caseSensitive) {
    return redirects.filter(({ from, to }) =>
        caseSensitive || `/${from.toLowerCase()}/` !== to.toLowerCase(),
    );
}
