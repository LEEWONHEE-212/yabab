# Git Hook 설치 안내 (main 브랜치 push 방지)
  -> 실수로 `main` 브랜치에 직접 push하지 않도록 Git hook을 사용

<- 설치 방법 (최초 1회만 실행) (Sourcetree 기준)
  1. dev 브랜치에서 우측 상단에 위치한 터미널(Git Bash)을 엽니다.
  2. 명령어 실행: ./install-hooks.sh

# 브랜치 운영 규칙
  main = 운영용 브랜치. 팀장만 직접 푸쉬
  dev = 팀원 전체가 공동 개발하는 브랜치

# 작업 전 필수 습관
 ★ 작업 시작 전에 항상 dev 에서 pull 받아서 최신 상태에서 작업 할 것
 ★ 작업 완료 후 dev에서 commit 한 다음에 push 전에 항상 pull 하고 할 것 
    (main에서 pull이 아니라 dev에서 pull임!!!!) -> 안 보고 main에서 풀 하면 GG

# 커밋 메시지 규칙
 [fe]: 페이지 UI, 스타일링, 컴포넌트 추가 등 프론트 관련 사항
 [be]: 기능 추가, DB, API생성 등 백 관련 사항
 [fix]: 모든 수정 사항 
 =>메시지 작성할 때 앞에 붙이고 관련 메시지 최대한 팀원들이 알 수 있게 자세히 적을 것!