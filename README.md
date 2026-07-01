# PNUHRM 자료 포털 (통합 저장소)

부산대학교병원 재활의학과의 **모든 자료를 한 곳에서** 관리하는 저장소입니다.
공개 주소: **https://pnuhrm.github.io/**

## 구조 — 폴더 = 카테고리

```
/                          ← 이 저장소 = 사이트 전체
├── index.html             ← 목차 (자동 생성, 직접 수정 불필요)
├── build-index.mjs        ← 목차 생성 스크립트
├── resident-edu/          ← 전공의 교육자료  (파일 여러 개 = 자료 목록)
│   └── *.html
├── duty/                  ← 당직·근무      (index.html = 단일 앱)
│   └── index.html
└── admin/ 등 …            ← 폴더를 만들면 자동으로 새 카테고리
```

- **폴더에 여러 HTML** → 그 폴더가 "자료 목록" 카테고리로 표시
- **폴더에 index.html 하나** → "앱" 카드 하나로 표시 (예: 당직 일정 생성기)
- 카테고리 한글 이름은 `build-index.mjs`의 `LABELS`에서 지정

## 자료 올리는 법 (git 몰라도 됨)

1. 저장소에서 **Add file → Upload files**
2. 원하는 폴더 경로로 HTML 올리기 (예: `resident-edu/새자료.html`)
   - 파일명 앞에 `폴더명/`을 붙이면 그 폴더(카테고리)로 들어갑니다
3. **Commit changes** → 약 1분 뒤 사이트 자동 반영

> HTML의 `<title>...</title>` 이 목차에 표시되는 제목입니다.

## 자동 배포 (관리자 최초 1회 설정)

1. `.github/workflows/deploy.yml` 추가 (아래 내용)
2. **Settings → Pages → Source → "GitHub Actions"** 선택

이후 파일을 올릴 때마다 목차가 자동 갱신되고 배포됩니다.

## 메모
- 옛 `resident-edu` 저장소는 이 저장소로 통합되었고, 백업용으로 **Archive** 상태입니다.
- 비공개가 필요한 자료는 이 공개 저장소에 올리지 마세요.

---
© PNUH Rehabilitation Medicine
