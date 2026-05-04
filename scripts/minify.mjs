/**
 * Production: writes main.min.js and style.min.css next to sources.
 * Run from repo root: npm run build
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify as terserMinify } from 'terser';
import CleanCSS from 'clean-css';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const mainPath = path.join(root, 'main.js');
const cssPath = path.join(root, 'style.css');
const outJs = path.join(root, 'main.min.js');
const outCss = path.join(root, 'style.min.css');

const mainSrc = fs.readFileSync(mainPath, 'utf8');
const jsResult = await terserMinify(mainSrc, {
  compress: { passes: 2, drop_console: true, pure_getters: true },
  mangle: true,
  format: { comments: false },
  sourceMap: false,
});

if (!jsResult.code) {
  process.stderr.write(jsResult.error ? String(jsResult.error) : 'terser: empty output\n');
  process.exit(1);
}
fs.writeFileSync(outJs, jsResult.code, 'utf8');

const cssSrc = fs.readFileSync(cssPath, 'utf8');
const cssResult = new CleanCSS({ level: 1 }).minify(cssSrc);
if (cssResult.errors && cssResult.errors.length) {
  process.stderr.write(cssResult.errors.join('\n') + '\n');
  process.exit(1);
}
fs.writeFileSync(outCss, cssResult.styles, 'utf8');

process.stdout.write(`OK: ${path.relative(root, outJs)}  ${path.relative(root, outCss)}\n`);
