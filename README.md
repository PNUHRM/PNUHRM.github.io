# PNUHRM 자료 포털

부산대학교병원 재활의학과(PNUHRM) 조직의 **루트 페이지**입니다.
공개 주소: **https://pnuhrm.github.io/**

## 이 저장소의 역할

조직에 속한 저장소 중 **웹사이트(GitHub Pages)가 켜진 것**을 자동으로 모아
포털 화면에 카드 목록으로 보여줍니다. (`index.html` 한 파일이 전부)

```
pnuhrm.github.io/            ← 이 저장소 (포털 · 목록 자동 표시)
 ├─ resident-edu/            ← 전공의 교육자료
 └─ (새 저장소 추가 시 자동 노출)
```

## 동작 방식

- `index.html`이 브라우저에서 GitHub API로 조직 저장소 목록을 읽어옵니다.
- 그중 **Pages가 켜진 공개 저장소만** 카드로 표시합니다.
- 새 저장소를 만들고 Pages만 켜면 **포털이 자동 갱신**됩니다. 이 파일을 손댈 필요 없음.

## 새 섹션(자료 사이트) 추가하기

1. 조직에 새 저장소 생성 (예: `admin`, `journal-club`)
2. HTML 파일을 넣고 **Settings → Pages**에서 배포 켜기
3. 끝 — 포털에 자동으로 카드가 추가됩니다

### 한글 제목 고정 (선택)

기본 제목은 저장소 description을 사용합니다. 예쁜 한글 제목으로 고정하려면
`index.html`의 `LABELS`에 한 줄 추가:

```js
const LABELS = {
  'resident-edu': '전공의 교육자료',
  'admin':        '행정 자료',
};
```

## 편집 시 주의

- 이 저장소는 **정적 파일을 브랜치에서 직접 배포**합니다 (별도 빌드 없음).
- `index.html`을 수정해 커밋하면 1~2분 뒤 사이트에 반영됩니다.
- 비공개로 두어야 할 자료는 이 포털(공개)에 노출되지 않도록, 해당 저장소의 Pages를 켜지 마세요.

---
© PNUH Rehabilitation Medicine
