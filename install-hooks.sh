#!/bin/bash

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-push"

echo "✅ Installing pre-push hook to prevent main branch push..."

# Hook 내용 정의
cat <<'EOF' > "$HOOK_FILE"
#!/bin/sh
branch="$(git rev-parse --abbrev-ref HEAD)"
if [ "$branch" = "main" ]; then
  echo "❌ main 브랜치에서는 직접 push할 수 없습니다. PR을 사용하세요."
  exit 1
fi
EOF

chmod +x "$HOOK_FILE"

echo "✅ Hook 설치 완료: $HOOK_FILE"
