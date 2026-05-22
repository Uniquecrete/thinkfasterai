/**
 * Imports .md files from AI-Blog-System/agent-outputs/content/
 * into src/content/blog/ with proper Astro frontmatter.
 *
 * Run: npm run import
 * Source dir is relative to this script or set SOURCE_DIR env var.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SOURCE_DIR = process.env.SOURCE_DIR || path.join(__dirname, '../../../ThinkFasterv1/AI-Blog-System/agent-outputs/content');
const DEST_DIR = path.join(__dirname, '../src/content/blog');

function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

function extractDate(content) {
  const match = content.match(/\*Published:\s*([^*]+)\*/);
  if (match) {
    const d = new Date(match[1].trim());
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}

function extractDescription(content, title) {
  const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#') && !l.startsWith('*Published'));
  const first = lines[0]?.replace(/\[.*?\]/g, '').replace(/[*_`]/g, '').trim();
  return first ? first.slice(0, 160) : title;
}

function slugify(filename) {
  return filename
    .replace(/\.md$/, '')
    .replace(/^KAN-\d+_/, '')
    .replace(/_/g, '-')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '');
}

function inferTags(title, content) {
  const text = (title + ' ' + content).toLowerCase();
  const tagMap = {
    'AI Writing': ['jasper', 'copy.ai', 'writesonic', 'writing', 'copywriting'],
    'Automation': ['n8n', 'make.com', 'zapier', 'automation', 'workflow'],
    'SEO': ['seo', 'search', 'surfer', 'keyword'],
    'AI Video': ['video', 'pictory', 'murf', 'voiceover'],
    'AI Tools': ['ai', 'claude', 'openai', 'gpt', 'llm'],
    'Productivity': ['productivity', 'notion', 'clickup', 'monday'],
    'Design': ['design', 'figma', 'stitch', 'css', 'ui'],
  };
  return Object.entries(tagMap)
    .filter(([, keywords]) => keywords.some(kw => text.includes(kw)))
    .map(([tag]) => tag)
    .slice(0, 3);
}

function stripInlineElements(content) {
  // Remove the H1 title and Published line since frontmatter handles them
  return content
    .replace(/^#\s+.+\n/m, '')
    .replace(/^\*Published:.*\*\n?/m, '')
    .trimStart();
}

function addFrontmatter(content, filename) {
  const title = extractTitle(content);
  const pubDate = extractDate(content);
  const description = extractDescription(content, title);
  const tags = inferTags(title, content);
  const body = stripInlineElements(content);

  const frontmatter = [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    `description: "${description.replace(/"/g, '\\"').slice(0, 160)}"`,
    `pubDate: "${pubDate}"`,
    `tags: [${tags.map(t => `"${t}"`).join(', ')}]`,
    '---',
    '',
  ].join('\n');

  return frontmatter + body;
}

if (!fs.existsSync(SOURCE_DIR)) {
  console.error(`Source dir not found: ${SOURCE_DIR}`);
  console.error('Set SOURCE_DIR env var to your agent-outputs/content path.');
  process.exit(1);
}

const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.md'));
let imported = 0;

for (const file of files) {
  const src = path.join(SOURCE_DIR, file);
  const slug = slugify(file);
  const dest = path.join(DEST_DIR, `${slug}.md`);
  const content = fs.readFileSync(src, 'utf8');

  if (fs.existsSync(dest)) {
    console.log(`⏭  Skipping ${slug} (already exists)`);
    continue;
  }

  const output = addFrontmatter(content, file);
  fs.writeFileSync(dest, output);
  console.log(`✅ Imported: ${slug}`);
  imported++;
}

console.log(`\nDone. ${imported} file(s) imported to src/content/blog/`);
