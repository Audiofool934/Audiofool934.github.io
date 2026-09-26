import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { legacyRedirects } from "../src/data/legacyRedirects.mjs";
import { isCaseSensitiveFilesystem, redirectsForFilesystem } from "../src/utils/legacyRoutes.mjs";

test("case-sensitive hosts retain every published legacy alias", () => {
    assert.deepEqual(redirectsForFilesystem(legacyRedirects, true), legacyRedirects);
});

test("case-insensitive hosts cannot overwrite a canonical page with its case alias", () => {
    const redirects = redirectsForFilesystem(legacyRedirects, false);
    assert(redirects.length < legacyRedirects.length);
    for (const { from, to } of redirects) assert.notEqual(`/${from.toLowerCase()}/`, to.toLowerCase());
    assert(redirects.some(({ from }) => from === "wiki/ICBS"));
    assert(!redirects.some(({ from }) => from === "audioshow/2-EP_1-50"));
});

test("filesystem detection cleans up its probe", () => {
    const directory = mkdtempSync(path.join(tmpdir(), "audiofool-routes-"));
    try {
        assert.equal(typeof isCaseSensitiveFilesystem(directory), "boolean");
        assert.deepEqual(readdirSync(directory), []);
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
});
