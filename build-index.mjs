// pnuhrm.github.io 통합 포털 — 폴더를 스캔해 카테고리별 목차 index.html을 자동 생성.
// 의존성 없음(Node 기본). GitHub Actions 또는 로컬에서 `node build-index.mjs`로 실행.
//
// 규칙:
//  - 최상위 폴더 = 카테고리(섹션)
//  - 폴더 안에 index.html 만 있으면  → 단일 앱 카드 (폴더로 링크)
//  - 폴더 안에 여러 .html 이 있으면    → 자료 목록 (각 파일 링크, 폴더 index.html 은 제외)
//  - 루트의 .html(자기 자신 index.html 제외) → "일반" 섹션
//
// ── 순서 정하기 ─────────────────────────────────────────────
//  ① 카테고리 순서 : 아래 ORDER 배열에 폴더명을 원하는 순서로 나열 (없는 건 뒤에 알파벳순)
//  ② 자료 순서    : (a) 파일명 앞에 숫자 접두사   예) 01_기초.html, 02_심화.html   (제목엔 안 보임)
//                  (b) 또는 HTML <head>에  <meta name="order" content="1">  추가 (URL 안 바뀜)
//                  숫자가 작을수록 위. 지정 없으면 파일명순.
import { readdirSync, readFileSync, writeFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const ROOT = process.cwd()
const SKIP = new Set(['.git', '.github', 'node_modules', 'assets', '.vscode'])

// 폴더명 → 표시할 한글 카테고리명(선택). 없으면 폴더명 그대로 사용.
const LABELS = {
  'resident-edu': '전공의 교육자료',
  'duty': '관리용',
  'admin': '행정 자료',
}

// 카테고리 표시 순서(선택). 여기 없는 폴더는 뒤에 알파벳순으로 붙습니다.
const ORDER = ['resident-edu', 'duty', 'admin']

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

// <title> 과 <meta name="order"> 를 함께 읽음
function metaOf(file) {
  const html = readFileSync(file, 'utf8')
  const t = html.match(/<title>([^<]*)<\/title>/i)
  const o = html.match(/<meta\s+name=["']order["']\s+content=["'](\d+)["']/i)
  return {
    title: (t ? t[1] : '').trim() || file.split(sep).pop().replace(/\.html$/, ''),
    order: o ? Number(o[1]) : Infinity,
  }
}
const rel = (f) => relative(ROOT, f).split(sep).join('/')

// 파일 정렬: (order 메타 → 파일명) 순
function sortFiles(files) {
  return files
    .map((f) => ({ f, ...metaOf(f) }))
    .sort((a, b) => a.order - b.order || rel(a.f).localeCompare(rel(b.f), 'ko'))
}

// 최상위 폴더 → ORDER 순, 나머지는 알파벳순
const topDirs = readdirSync(ROOT)
  .filter((n) => !SKIP.has(n) && !n.startsWith('.') && statSync(join(ROOT, n)).isDirectory())
  .sort((a, b) => {
    const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b)
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 1e9 : ia) - (ib === -1 ? 1e9 : ib)
    return a.localeCompare(b, 'ko')
  })

const sections = []

for (const dir of topDirs) {
  const htmls = walkHtml(join(ROOT, dir))
  if (!htmls.length) continue
  const indexPath = join(ROOT, dir, 'index.html')
  const hasIndex = existsSync(indexPath)
  const others = htmls.filter((f) => f !== indexPath)

  let items
  if (hasIndex && others.length === 0) {
    items = [{ href: dir + '/', title: metaOf(indexPath).title }]     // 단일 앱
  } else {
    items = sortFiles(others).map((x) => ({ href: rel(x.f), title: x.title }))
  }
  sections.push({ title: LABELS[dir] || dir, items })
}

// 루트 직속 html (index.html 제외)
const rootHtml = readdirSync(ROOT)
  .filter((n) => n.endsWith('.html') && n !== 'index.html')
  .map((n) => join(ROOT, n))
if (rootHtml.length) {
  sections.push({ title: '일반', items: sortFiles(rootHtml).map((x) => ({ href: rel(x.f), title: x.title })) })
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
