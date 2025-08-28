# 컨벤션
## Commit Message 커밋 메시지 관련
### Commit Message 형식
기본적으로 타입은 필수. 분류는 옵션. 그래도 chore 말고는 어떤 분야/기능에 관한 커밋인지 간단히 적으면 좋을 듯.
- "타입(분류) = 커밋 메시지 공통 형식" 
- "feat" = 기능 추가 시
- "docs" = 문서 추가 및 변경 시
- "refactor" = 기능 변경 없이 코드 수정 시
- "fix" = 버그 수정
- "test" = 테스트 코드 추가 시
- "chore" = 환경 설정 같은 것 수정 시
- "pref" = 성능 개선 작업 시

### Commit Message 예시
```
feat(back/login): 이메일 로그인 기능 구현
fix(back/strategy): 전략 설명 로딩 오류 수정
docs(readme): 프로젝트 설명 업데이트
style(front/header): 들여쓰기 수정 및 주석 정리
refactor(back/user-service): 사용자 조회 로직 정리
chore: .gitgnore 수정
```

## Directory Structure 디렉터리 구조
빈 디렉터리를 github에 올리기 위해서 .gitkeep 이라는 
빈 파일을 디렉터리마다 만들어 뒀는데, 실제 내용 넣으실 때 삭제하시면 됩니다.
```swift
project-root/
├── frontend/         # React 기반 프론트엔드
├── backend/          # Java Spring Boot 백엔드
├── ai/               # Python 기반 AI 모델
├── docs/             # 프로젝트 관련 문서
├── .gitignore        # Git 제외 파일 목록
└── README.md         # 프로젝트 최상위 설명서
```

## .gitignore file
불필요한 정보가 github에 올라가는 것을 막기 위한 파일.
ai와 backend에서 올라가야 할 내용이 포함되어 있다면 
.gitignore 파일에서 기록된 경로를 삭제하면 github에 잘 올라갈 겁니다.

## Branch 브랜치 관련
- 영구 branch 들 
	- 특별한 상황 없으면 계속 유지 시킬 브랜치들.
		- 배포용 main
		- 개발용 develop
			- develop 아래 파트별 브랜치들
	- 여기는 바로 commit 금지. 꼭 다른 브랜치에서 작업하고 PR을 올려서 합치자.
- 임시 branch 들
	- 각 베이스 branch에서 분기 되는 작업 단위 브랜치
	- 간단한 단위 혹은 통합 테스트 용으로 사용할 임시 브랜치
되도록이면 기능별로 완성 될 때마다 커밋하고 PR을 올리는 게 좋을 것 같다. 
그래야 면담 준비 시 편하지 않을까 싶음.

### Branch 구조
```swift 
main                  ← 운영용 배포 브랜치. 영구.
└── develop            ← 전체 통합 브랜치. 영구. 프론트랑 백엔드랑 통합 완료 시
    ├── frontend/      ← 영구.
    │   ├── feat-login          ← 로그인 기능 개발 (임시. 완료시 frontend에 병합)
    │   ├── fix-header          ← 헤더 버그 수정 (임시. 완료시 frontend에 병합)
    ├── backend/       ← 영구.       
    │   ├── feat-auth-api       ← 인증 API 개발 (임시. 완료시 backend에 병합)
    ├── integration/login-test  ← 프론트와 백 병합 테스트용 임시 브랜치.
//    ├── ai/             // ai 파트는 편한대로..
//        ├── feat-color-model    ← 컬러 AI 모델 개선 (완료시 ai에 병합)
//        ├── feat-modern-style   ← 모던한 로고 생성기 훈련 (완료시 ai에 병합)
```



