# Local Gallery desk

Run `npm run gallery:intake`, then open `http://127.0.0.1:4392`.
This private editor serves the prepared photo batch in `.local/gallery-intake/manifest.json` and its `thumbs/` and `previews/` directories.
The data directory is ignored by Git and is outside the Astro site.
Set `GALLERY_INTAKE_DATA` or `GALLERY_INTAKE_PORT` to use an isolated batch or port.

Edit each photo's title, location, and group.
The group is stored as `category`, matching the Gallery schema.
New group names and locations become suggestions for later photos.
“沿用上一张” copies only the preceding photo's location and group into currently empty fields.
A photo counts as filled when all three fields contain text.

Edits are automatically saved to the local manifest, with a previous-save backup in `manifest.json.previous`.
Pending edits are also cached in the browser and restored after reopening.
The save indicator reports disk-write failures; export remains available to back up unsaved edits.
Per-photo revisions reject conflicting writes from another page.
On a conflict, export the local edits and reconcile them against the manifest before clearing that page's browser draft.

The original source files remain untouched.
The editor serves sRGB preview derivatives and does not expose source GPS coordinates.
Export downloads a JSON copy for later Gallery import; this editor does not publish, commit, or deploy.
Stop the local server with Ctrl+C after finishing.
