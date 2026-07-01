// pnuhrm.github.io 통합 포털 — 폴더를 스캔해 카테고리별 목차 index.html을 자동 생성.
// 의존성 없음(Node 기본). GitHub Actions 또는 로컬에서 `node build-index.mjs`로 실행.
//
// 규칙:
//  - 최상위 폴더 = 카테고리(섹션)
//  - 폴더 안에 index.html 만 있으면  → 단일 앱 카드 (폴더로 링크)
//  - 폴더 안에 여러 .html 이 있으면    → 자료 목록 (각 파일 링크, 폴더 index.html 은 제외)
//  - 루트의 .html(자기 자신 index.html 제외) → "일반" 섹션
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()
const SKIP = new Set(['.git', '.github', 'node_modules', 'assets', '.vscode'])

// 폴더명 → 표시할 한글 카테고리명(선택). 없으면 폴더명 그대로 사용.
const LABELS = {
  'resident-edu': '전공의 교육자료',
  'duty': '당직 · 근무',
  'admin': '행정 자료',
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function walkHtml(dir) {
  let out = []
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name) || name.startsWith('.')) continue
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out = out.concat(walkHtml(full))
    else if (name.endsWith('.html')) out.push(full)
  }
  return out
}

function titleOf(file) {
  const m = readFileSync(file, 'utf8').match(/<title>([^<]*)<\/title>/i)
  return (m ? m[1] : '').trim() || file.split(sep).pop().replace(/\.html$/, '')
}
const rel = (f) => relative(ROOT, f).split(sep).join('/')

// 최상위 폴더 목록
const topDirs = readdirSync(ROOT)
  .filter((n) => !SKIP.has(n) && !n.startsWith('.') && statSync(join(ROOT, n)).isDirectory())
  .sort()

const sections = []

for (const dir of topDirs) {
  const htmls = walkHtml(join(ROOT, dir))
  if (!htmls.length) continue
  const indexPath = join(ROOT, dir, 'index.html')
  const hasIndex = existsSync(indexPath)
  const others = htmls.filter((f) => f !== indexPath)

  let items
  if (hasIndex && others.length === 0) {
    // 단일 앱
    items = [{ href: dir + '/', title: titleOf(indexPath) }]
  } else {
    // 자료 목록 (폴더 index.html 은 제외)
    items = others.map((f) => ({ href: rel(f), title: titleOf(f) }))
  }
  sections.push({ title: LABELS[dir] || dir, items })
}

// 루트 직속 html (index.html 제외)
const rootHtml = readdirSync(ROOT)
  .filter((n) => n.endsWith('.html') && n !== 'index.html')
  .sort()
if (rootHtml.length) {
  sections.push({ title: LABELS['일반'] || '일반', items: rootHtml.map((n) => ({ href: n, title: titleOf(join(ROOT, n)) })) })
}

const total = sections.reduce((a, s) => a + s.items.length, 0)

const body = sections.map((s) => `
  <section>
    <h2>${esc(s.title)}</h2>
    <div class="grid">
      ${s.items.map((it) => `<a class="card" href="./${it.href}"><span class="arrow">&rarr;</span><div class="t">${esc(it.title)}</div></a>`).join('\n      ')}
    </div>
  </section>`).join('\n')

const html = `<!doctype html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>부산대학교병원 재활의학과</title>
<style>
  :root{--brand:#1a5276}
  *{box-sizing:border-box}
  body{font-family:-apple-system,'Malgun Gothic',sans-serif;max-width:820px;margin:0 auto;padding:48px 18px;line-height:1.6;color:#222;background:#f8fafc}
  header{text-align:center;margin-bottom:28px}
  header h1{color:var(--brand);margin:0 0 6px;font-size:26px}
  header p{color:#667;margin:0;font-size:14px}
  h2{font-size:15px;color:#fff;background:var(--brand);padding:5px 14px;border-radius:6px;margin:28px 0 12px}
  .grid{display:grid;gap:12px}
  .card{display:block;padding:18px 20px;background:#fff;border:1px solid #e2e8f0;border-radius:14px;
        text-decoration:none;color:inherit;transition:.15s;box-shadow:0 1px 3px rgba(0,0,0,.04)}
  .card:hover{border-color:var(--brand);box-shadow:0 4px 14px rgba(26,82,118,.12);transform:translateY(-1px)}
  .card .t{font-size:17px;font-weight:700;color:var(--brand)}
  .card .arrow{float:right;color:#94a3b8;font-size:18px}
  footer{text-align:center;margin-top:40px;font-size:12px;color:#aab;border-top:1px solid #e8edf2;padding-top:16px}
</style></head>
<body>
  <header>
    <h1>부산대학교병원 재활의학과</h1>
    <p>PNUHRM · 자료 포털</p>
  </header>
${body || '  <p style="text-align:center;color:#94a3b8">아직 자료가 없습니다.</p>'}
  <footer>총 ${total}개 자료 · 이 목록은 폴더를 스캔해 자동 생성됩니다 · &copy; PNUH Rehabilitation Medicine</footer>
</body></html>
`

writeFileSync(join(ROOT, 'index.html'), html)
console.log(`index.html generated: ${total} items in ${sections.length} sections [${sections.map((s) => s.title).join(', ')}]`)
