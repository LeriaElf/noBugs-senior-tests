FULL=$(jq '.coverageOperationMap.counter.full' swagger-coverage-results.json)
ALL=$(jq  '.coverageOperationMap.counter.all'  swagger-coverage-results.json)
COVERAGE=$(( FULL * 100 / ALL ))

echo "API coverage: $COVERAGE% ($FULL/$ALL)"

if [ "$COVERAGE" -lt 50 ]; then
  echo "❌ Coverage $COVERAGE% < 50% — quality gate failed"
  exit 1
fi
echo "✅ Coverage $COVERAGE% >= 50% — quality gate passed"
