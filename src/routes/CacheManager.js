const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const config = require(path.join(__dirname, '..', '..', 'Config.js'));

const router = express.Router();
const CACHE_ROOT = path.resolve(config.cache_root_abs);
const CACHE_MANAGER_PATH = config.cache_manager_path || '/cache-manager';

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function normalizeRelativeFolder(input) {
  const raw = String(input || '').replace(/\\/g, '/').trim();
  if (!raw || raw === '/' || raw === '.') return '';
  const normalized = path.posix.normalize(raw).replace(/^\/+/, '');
  if (
    normalized === '..' ||
    normalized.startsWith('../') ||
    normalized.includes('/../') ||
    normalized.includes('..\\')
  ) {
    throw new Error('invalid folder');
  }
  return normalized;
}

function resolveCachePath(relativeFolder) {
  const safeRelative = normalizeRelativeFolder(relativeFolder);
  const resolved = path.resolve(path.join(CACHE_ROOT, safeRelative));
  if (!resolved.startsWith(CACHE_ROOT)) {
    throw new Error('invalid path');
  }
  return { safeRelative, resolved };
}

function walkFolders(baseDir, relative = '') {
  const currentDir = path.join(baseDir, relative);
  const items = fs.existsSync(currentDir)
    ? fs.readdirSync(currentDir, { withFileTypes: true })
    : [];
  const folders = [];

  for (const item of items) {
    if (!item.isDirectory()) continue;
    const rel = relative ? `${relative}/${item.name}` : item.name;
    folders.push(rel);
    folders.push(...walkFolders(baseDir, rel));
  }

  return folders.sort((a, b) => a.localeCompare(b));
}

function listFilesInFolder(relativeFolder) {
  const { resolved } = resolveCachePath(relativeFolder);
  if (!fs.existsSync(resolved)) return [];

  return fs.readdirSync(resolved, { withFileTypes: true })
    .map((entry) => {
      const fullPath = path.join(resolved, entry.name);
      const stat = entry.isFile() ? fs.statSync(fullPath) : null;
      return {
        name: entry.name,
        type: entry.isDirectory() ? 'folder' : 'file',
        size: stat ? stat.size : 0
      };
    })
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderPage({ folders, currentFolder, files, message, error }) {
  const folderOptions = ['']
    .concat(folders)
    .map((folder) => {
      const selected = folder === currentFolder ? ' selected' : '';
      const label = folder || '/';
      return `<option value="${escapeHtml(folder)}"${selected}>${escapeHtml(label)}</option>`;
    })
    .join('');

  const folderLinks = ['<li><a href="?folder=">/</a></li>']
    .concat(
      folders.map((folder) => (
        `<li><a href="?folder=${encodeURIComponent(folder)}">${escapeHtml(folder)}</a></li>`
      ))
    )
    .join('');

  const fileRows = files.length
    ? files.map((file) => (
        `<tr>
          <td>${escapeHtml(file.type)}</td>
          <td>${escapeHtml(file.name)}</td>
          <td>${file.type === 'file' ? file.size : '-'}</td>
        </tr>`
      )).join('')
    : '<tr><td colspan="3">Kosong</td></tr>';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Cache Manager</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body{font-family:Arial,sans-serif;background:#111;color:#eee;margin:0;padding:24px}
    .wrap{max-width:1200px;margin:0 auto}
    .grid{display:grid;grid-template-columns:320px 1fr;gap:20px}
    .card{background:#1a1a1a;border:1px solid #2a2a2a;border-radius:12px;padding:16px}
    input,select,button{width:100%;padding:10px;border-radius:8px;border:1px solid #333;background:#0f0f0f;color:#fff;box-sizing:border-box}
    button{cursor:pointer;background:#2563eb;border:none}
    button:hover{background:#1d4ed8}
    ul{padding-left:18px;max-height:500px;overflow:auto}
    a{color:#7dd3fc;text-decoration:none}
    a:hover{text-decoration:underline}
    table{width:100%;border-collapse:collapse}
    th,td{border-bottom:1px solid #2a2a2a;padding:10px;text-align:left}
    .msg{padding:12px;border-radius:10px;margin-bottom:14px}
    .ok{background:#052e16;color:#86efac}
    .err{background:#450a0a;color:#fca5a5}
    .muted{color:#aaa;font-size:13px}
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Cache Manager</h1>
    <p class="muted">Root: public/cache</p>
    ${message ? `<div class="msg ok">${escapeHtml(message)}</div>` : ''}
    ${error ? `<div class="msg err">${escapeHtml(error)}</div>` : ''}
    <div class="grid">
      <div class="card">
        <h2>Folders</h2>
        <ul>${folderLinks}</ul>
      </div>
      <div class="card">
        <h2>Upload File</h2>
        <form method="post" action="${escapeHtml(CACHE_MANAGER_PATH)}/upload" enctype="multipart/form-data">
          <label>Folder tujuan</label>
          <select name="folder">${folderOptions}</select>
          <br><br>
          <label>Pilih file</label>
          <input type="file" name="file" required>
          <br><br>
          <button type="submit">Upload</button>
        </form>
        <br>
        <p class="muted">Max 10MB. Support rttex, xml, wav, ogg, dan file lain juga.</p>
      </div>
    </div>
    <br>
    <div class="card">
      <h2>Isi Folder: ${escapeHtml(currentFolder || '/')}</h2>
      <table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Size</th>
          </tr>
        </thead>
        <tbody>${fileRows}</tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
}

ensureDir(CACHE_ROOT);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      const folder = req.body.folder || '';
      const { resolved } = resolveCachePath(folder);
      ensureDir(resolved);
      cb(null, resolved);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const safeName = path.basename(file.originalname || 'upload.bin').replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload_max_file_size || 10 * 1024 * 1024
  }
});

router.get(CACHE_MANAGER_PATH, (req, res) => {
  try {
    const folder = normalizeRelativeFolder(req.query.folder || '');
    const folders = walkFolders(CACHE_ROOT);
    const files = listFilesInFolder(folder);

    res.status(200).type('html').send(renderPage({
      folders,
      currentFolder: folder,
      files,
      message: req.query.message || '',
      error: req.query.error || ''
    }));
  } catch (err) {
    res.status(400).type('html').send(renderPage({
      folders: walkFolders(CACHE_ROOT),
      currentFolder: '',
      files: [],
      message: '',
      error: err.message || 'failed to open cache manager'
    }));
  }
});

router.post(CACHE_MANAGER_PATH + '/upload', (req, res) => {
  upload.single('file')(req, res, (err) => {
    const folder = String(req.body?.folder || '');

    if (err) {
      return res.redirect(`${CACHE_MANAGER_PATH}?folder=${encodeURIComponent(folder)}&error=${encodeURIComponent(err.message || 'upload failed')}`);
    }

    if (!req.file) {
      return res.redirect(`${CACHE_MANAGER_PATH}?folder=${encodeURIComponent(folder)}&error=${encodeURIComponent('no file uploaded')}`);
    }

    return res.redirect(`${CACHE_MANAGER_PATH}?folder=${encodeURIComponent(folder)}&message=${encodeURIComponent(`upload success: ${req.file.filename}`)}`);
  });
});

module.exports = router;