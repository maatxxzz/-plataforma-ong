import { readFile, writeFile } from 'node:fs/promises';
import { minify } from 'html-minifier-terser';

const file = new URL('../dist/index.html', import.meta.url);
const html = await readFile(file, 'utf8');
await writeFile(file, await minify(html, {
  collapseWhitespace: true,
  conservativeCollapse: true,
  removeComments: true,
  removeOptionalTags: false,
  removeAttributeQuotes: false,
  minifyJS: true,
  minifyCSS: true,
}));
