import assert from "node:assert/strict";
import { test } from "node:test";
import { AUDIO_IMAGE_WIDTHS, audioImage, audioImageSrcset, audioImageVariantPath } from "../src/utils/audioImages.mjs";
import { rehypeImgAttrs } from "../src/utils/rehypeImages.mjs";

test("artwork URLs encode filenames without changing generated disk paths", () => {
    const source = "/images/audioshow/Artist's album/cover #1.jpg";
    for (const width of AUDIO_IMAGE_WIDTHS) {
        const url = audioImage(source, width);
        assert.equal(decodeURIComponent(url), audioImageVariantPath(source, width));
        assert(!url.includes(" ") && !url.includes("'") && !url.includes("#"));
    }
    assert.equal(audioImage("https://example.com/cover.jpg"), "https://example.com/cover.jpg");
    assert.equal(audioImage("/images/audioshow/_generated/cover-320.webp"), "/images/audioshow/_generated/cover-320.webp");
    assert.equal(audioImage(undefined), undefined);
    assert.equal(audioImageSrcset("https://example.com/cover.jpg"), undefined);
    assert.throws(() => audioImage(source, 640), /Unsupported artwork width/);
});

test("Markdown elements and raw HTML receive the same responsive artwork policy", () => {
    const src = "/images/audioshow/cover.jpg";
    const tree = { type: "root", children: [
        { type: "element", tagName: "img", properties: { src, loading: "eager" } },
        { type: "raw", value: `<img src="${src}" loading="eager" data-audio-url="/track.mp3">` },
        { type: "element", tagName: "img", properties: { src: "https://example.com/remote.jpg" } },
        { type: "raw", value: '<img src="https://example.com/remote.jpg" decoding="sync">' },
    ] };
    rehypeImgAttrs()(tree);
    const [element, raw, remote, remoteRaw] = tree.children;
    assert.equal(element.properties.src, audioImage(src));
    assert.equal(element.properties.srcset, audioImageSrcset(src));
    assert.equal(element.properties.loading, "eager");
    assert(raw.value.includes(`src="${element.properties.src}"`));
    assert(raw.value.includes(`srcset="${element.properties.srcset}"`));
    assert(raw.value.includes('loading="eager"') && raw.value.includes('data-audio-url="/track.mp3"'));
    assert.equal(remote.properties.referrerpolicy, "no-referrer");
    assert(remoteRaw.value.includes('referrerpolicy="no-referrer"') && remoteRaw.value.includes('decoding="sync"'));
});
