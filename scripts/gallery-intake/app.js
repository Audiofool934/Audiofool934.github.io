const $ = (id) => document.getElementById(id);
const fields = ['title', 'location', 'category'];
let session, active = 0, timer, saving, saveFailure = '', storageFailure = false;
const pending = new Map();
const complete = (photo) => fields.every((field) => photo[field].trim());
const edits = (photo) => Object.fromEntries(fields.map((field) => [field, photo[field]]));
const same = (a, b) => fields.every((field) => a[field] === b[field]);
const current = () => session.photos[active];
const storageKey = () => `gallery-desk:${session.id}`;

function stash() {
  try {
    localStorage.setItem(storageKey(), JSON.stringify({ active: current().id, pending: [...pending].map(([id, draft]) => ({ id, revision: draft.revision, ...edits(session.photos.find((photo) => photo.id === id)) })) }));
    storageFailure = false;
  } catch { storageFailure = true; }
}

function saveStatus() {
  const message = saveFailure || (pending.size ? (saving ? '正在保存…' : '等待保存…') : '已保存到本机');
  $('save-status').textContent = message + (storageFailure && pending.size ? ' · 浏览器暂存不可用，请保持页面打开' : '');
  $('save-status').parentElement.dataset.error = String(!!saveFailure);
  $('retry').hidden = !saveFailure;
}

async function flush() {
  clearTimeout(timer);
  if (saving) return saving;
  if (saveFailure || !pending.size) return;
  saving = (async () => {
    while (pending.size && !saveFailure) {
      const id = pending.keys().next().value;
      const photo = session.photos.find((item) => item.id === id);
      const submitted = { revision: pending.get(id).revision, ...edits(photo) };
      try {
        const response = await fetch(`/api/photos/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(submitted) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || '保存失败，请重试');
        photo.revision = result.photo.revision;
        pending.get(id).revision = result.photo.revision;
        session.updatedAt = result.updatedAt;
        if (same(photo, submitted)) pending.delete(id);
        stash();
      } catch (error) { saveFailure = error.message === 'Failed to fetch' ? '连接中断，修改已暂存。连接恢复后请重试。' : error.message; }
    }
  })();
  saveStatus();
  await saving;
  saving = undefined;
  saveStatus();
}

function queue() {
  if (!pending.has(current().id)) pending.set(current().id, { revision: current().revision });
  stash();
  clearTimeout(timer);
  timer = setTimeout(flush, 350);
  syncUi();
  saveStatus();
}

function renderList() {
  const list = $('photo-list');
  const { scrollTop, scrollLeft } = list;
  const fragment = document.createDocumentFragment();
  session.photos.forEach((photo, index) => {
    const done = complete(photo);
    if (($('filter').value === 'incomplete' && done) || ($('filter').value === 'complete' && !done)) return;
    const button = document.createElement('button');
    button.className = 'thumb';
    button.dataset.index = index;
    button.setAttribute('aria-current', String(index === active));
    button.setAttribute('aria-label', `第 ${index + 1} 张 ${photo.title || '未命名'}，${done ? '已填写' : '待填写'}`);
    const image = document.createElement('img');
    image.src = `/thumbs/${photo.id}.jpg`;
    image.alt = '';
    image.loading = 'lazy';
    image.width = 62;
    image.height = 53;
    const label = document.createElement('span');
    label.className = 'thumb-label';
    const title = document.createElement('span');
    title.className = 'thumb-title';
    title.textContent = photo.title || '未命名';
    const meta = document.createElement('span');
    meta.className = 'thumb-meta';
    meta.textContent = `${String(index + 1).padStart(2, '0')} / ${photo.date.slice(5)}`;
    label.append(title, meta);
    button.append(image, label);
    if (done) { const dot = document.createElement('span'); dot.className = 'thumb-dot'; button.append(dot); }
    button.addEventListener('click', () => selectPhoto(index));
    fragment.append(button);
  });
  list.replaceChildren(fragment);
  list.scrollTop = scrollTop;
  list.scrollLeft = scrollLeft;
  $('empty-list').hidden = !!list.children.length;
}

function suggestions() {
  const groups = [...new Set([...session.photos.map((photo) => photo.category.trim()).filter(Boolean), ...session.suggestedCategories])];
  const locations = [...new Set(session.photos.map((photo) => photo.location.trim()).filter(Boolean))];
  for (const [id, values] of [['categories', groups], ['locations', locations]]) {
    $(id).replaceChildren(...values.map((value) => { const option = document.createElement('option'); option.value = value; return option; }));
  }
  $('group-suggestions').replaceChildren(...groups.slice(0, 5).map((group) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = group;
    button.addEventListener('click', () => { $('category').value = group; current().category = group; queue(); });
    return button;
  }));
}

function syncUi() {
  const done = session.photos.filter(complete).length;
  $('progress').textContent = `${done} / ${session.photos.length} 已填写`;
  $('percent').textContent = `${Math.round(done / session.photos.length * 100)}%`;
  $('progress-bar').max = session.photos.length;
  $('progress-bar').value = done;
  $('item-status').textContent = complete(current()) ? '✓ 已填写' : '待填写';
  $('preview-title').textContent = current().title || '未命名';
  $('preview').alt = current().title || '照片预览';
  $('continue').firstChild.textContent = done === session.photos.length ? '已填完，导出清单 ' : '下一张待填写 ';
  const previous = session.photos[active - 1];
  $('reuse').disabled = !previous || !((!current().location.trim() && previous.location.trim()) || (!current().category.trim() && previous.category.trim()));
  renderList();
}

function selectPhoto(index, reveal = false) {
  if (index < 0 || index >= session.photos.length) return;
  active = index;
  const photo = current();
  for (const field of fields) $(field).value = photo[field];
  $('preview').src = `/previews/${photo.id}.jpg`;
  $('photo-number').textContent = `FRAME ${String(index + 1).padStart(2, '0')} / ${session.photos.length}`;
  $('photo-date').textContent = photo.date;
  $('camera-line').textContent = `${photo.cameraLabel} · ${photo.exif.focalLength} · ${photo.exif.aperture} · ${photo.exif.shutterSpeed}s · ISO ${photo.exif.iso}`;
  const details = [['日期', photo.capturedAt], ['相机', photo.cameraLabel], ['镜头', photo.exif.lens], ['曝光', `${photo.exif.shutterSpeed}s · ${photo.exif.aperture} · ISO ${photo.exif.iso}`], ['尺寸', `${photo.width} × ${photo.height}`]];
  $('exif-values').replaceChildren(...details.flatMap(([key, value]) => { const dt = document.createElement('dt'), dd = document.createElement('dd'); dt.textContent = key; dd.textContent = value; return [dt, dd]; }));
  $('filename').textContent = photo.sourceFilename;
  $('previous').disabled = index === 0;
  $('next').disabled = index === session.photos.length - 1;
  syncUi();
  suggestions();
  stash();
  const selected = $('photo-list').querySelector('[aria-current="true"]');
  if (selected) selected.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  if (reveal && matchMedia('(max-width:850px)').matches) document.querySelector('.viewer').scrollIntoView({ block: 'start' });
}

async function exportDraft() {
  await flush();
  const blob = new Blob([JSON.stringify({ ...session, exportedAt: new Date().toISOString(), hasUnsavedChanges: pending.size > 0 }, null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `gallery-draft-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

try {
  const response = await fetch('/api/session');
  if (!response.ok) throw new Error('无法读取照片清单，请确认本地服务正在运行。');
  session = await response.json();
  try {
    const cached = JSON.parse(localStorage.getItem(storageKey()) || '{}');
    if (cached.active) active = Math.max(0, session.photos.findIndex((photo) => photo.id === cached.active));
    for (const draft of cached.pending || []) {
      const photo = session.photos.find((item) => item.id === draft.id);
      if (!photo || !fields.every((field) => typeof draft[field] === 'string') || same(photo, draft)) continue;
      if (photo.revision !== draft.revision) saveFailure = '有未保存的本地修改，且另一页面已更新。请导出备份后刷新。';
      Object.assign(photo, edits(draft));
      pending.set(photo.id, { revision: draft.revision });
    }
  } catch { storageFailure = true; }
  $('loading').hidden = true;
  $('desk').hidden = false;
  $('export').disabled = false;
  selectPhoto(active);
  saveStatus();
  for (const field of fields) $(field).addEventListener('input', () => { current()[field] = $(field).value; queue(); });
  $('location').addEventListener('change', suggestions);
  $('category').addEventListener('change', suggestions);
  $('filter').addEventListener('change', renderList);
  $('form').addEventListener('submit', (event) => { event.preventDefault(); $('continue').click(); });
  $('previous').addEventListener('click', () => selectPhoto(active - 1, true));
  $('next').addEventListener('click', () => selectPhoto(active + 1, true));
  $('continue').addEventListener('click', () => {
    const next = Array.from({ length: session.photos.length }, (_, offset) => (active + offset + 1) % session.photos.length).find((index) => !complete(session.photos[index]));
    if (next === undefined) exportDraft();
    else selectPhoto(next, true);
  });
  $('reuse').addEventListener('click', () => {
    const previous = session.photos[active - 1];
    if (!previous) return;
    for (const field of ['location', 'category']) if (!current()[field].trim()) { current()[field] = previous[field]; $(field).value = previous[field]; }
    queue(); suggestions();
  });
  $('retry').addEventListener('click', () => { saveFailure = ''; flush(); });
  $('export').addEventListener('click', exportDraft);
  $('enlarge').addEventListener('click', () => { $('large-image').src = $('preview').src; $('large-image').alt = $('preview').alt; $('lightbox').showModal(); });
  $('close-lightbox').addEventListener('click', () => $('lightbox').close());
  $('lightbox').addEventListener('click', (event) => { if (event.target === $('lightbox')) $('lightbox').close(); });
  document.addEventListener('keydown', (event) => {
    if (event.target.closest('input, select, textarea, button, summary') || $('lightbox').open || event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); selectPhoto(active + (event.key === 'ArrowRight' ? 1 : -1), true); }
  });
  window.addEventListener('beforeunload', (event) => { if (pending.size) event.preventDefault(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  window.addEventListener('online', () => { if (saveFailure.startsWith('连接中断')) { saveFailure = ''; flush(); } });
  if (pending.size) flush();
} catch (error) { $('loading').textContent = error.message; }
