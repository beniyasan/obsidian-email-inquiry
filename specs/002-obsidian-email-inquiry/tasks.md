# Tasks: Obsidian Email Inquiry Management System

**Input**: Design documents from `/specs/002-obsidian-email-inquiry/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

## Execution Flow (main)
```
1. Load plan.md from feature directory ✓
   → Tech stack: TypeScript 5.x, Node.js 18+, Obsidian API
   → Libraries: email-parser, daily-summary, knowledge-base
   → Structure: Single project (Obsidian plugin)
2. Load design documents ✓:
   → data-model.md: EmailInquiry, DailySummary, KnowledgeEntry, ResolutionNote, Tag
   → contracts/: plugin-api.yaml, cli-commands.md
   → research.md: Email parsing decisions, storage patterns
3. Generated tasks by category ✓
4. Applied task rules: [P] for parallel, TDD order ✓
5. Numbered sequentially (T001-T028) ✓
6. Dependency graph created ✓
7. Parallel execution examples ✓
8. Validation passed ✓
```

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Paths assume single project structure from plan.md

## Phase 3.1: Setup

- [ ] T001 Create Obsidian plugin project structure in src/ with models/, services/, cli/, lib/ folders
- [ ] T002 Initialize TypeScript project with Obsidian API, Jest, and required dependencies in package.json
- [ ] T003 [P] Configure ESLint, Prettier, and TypeScript compiler options in tsconfig.json

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T004 [P] Contract test email capture command in tests/contract/email-capture.test.ts
- [ ] T005 [P] Contract test daily summary generation in tests/contract/daily-summary.test.ts
- [ ] T006 [P] Contract test knowledge search in tests/contract/knowledge-search.test.ts
- [ ] T007 [P] Contract test bulk import in tests/contract/bulk-import.test.ts
- [ ] T008 [P] Contract test email resolution in tests/contract/email-resolution.test.ts

### CLI Contract Tests
- [ ] T009 [P] CLI contract test email-parser parse command in tests/contract/cli-email-parser.test.ts
- [ ] T010 [P] CLI contract test daily-summary generate in tests/contract/cli-daily-summary.test.ts
- [ ] T011 [P] CLI contract test knowledge-base search in tests/contract/cli-knowledge-base.test.ts

### Integration Tests
- [ ] T012 [P] Integration test email capture workflow in tests/integration/email-capture-flow.test.ts
- [ ] T013 [P] Integration test daily summary generation in tests/integration/daily-summary-flow.test.ts
- [ ] T014 [P] Integration test knowledge extraction in tests/integration/knowledge-extraction-flow.test.ts
- [ ] T015 [P] Integration test bulk import workflow in tests/integration/bulk-import-flow.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Data Models
- [ ] T016 [P] EmailInquiry model with validation in src/models/EmailInquiry.ts
- [ ] T017 [P] DailySummary model in src/models/DailySummary.ts
- [ ] T018 [P] KnowledgeEntry model in src/models/KnowledgeEntry.ts
- [ ] T019 [P] ResolutionNote model in src/models/ResolutionNote.ts
- [ ] T020 [P] Tag model in src/models/Tag.ts

### Library Core Services
- [ ] T021 [P] EmailParser library in src/lib/email-parser/index.ts
- [ ] T022 [P] DailySummary library in src/lib/daily-summary/index.ts
- [ ] T023 [P] KnowledgeBase library in src/lib/knowledge-base/index.ts

### Plugin Services
- [ ] T024 EmailParser service in src/services/EmailParser.ts
- [ ] T025 SummaryGenerator service in src/services/SummaryGenerator.ts
- [ ] T026 KnowledgeIndexer service in src/services/KnowledgeIndexer.ts

### CLI Commands
- [ ] T027 [P] Email parser CLI in src/cli/email-parser-cli.ts
- [ ] T028 [P] Daily summary CLI in src/cli/summary-cli.ts
- [ ] T029 [P] Knowledge base CLI in src/cli/knowledge-cli.ts

## Phase 3.4: Plugin Integration

- [ ] T030 Obsidian plugin main class in src/main.ts
- [ ] T031 Command palette integration for email capture
- [ ] T032 Command palette integration for daily summary
- [ ] T033 Command palette integration for knowledge search
- [ ] T034 Settings tab implementation
- [ ] T035 File system integration with Obsidian Vault API
- [ ] T036 Search integration with Obsidian MetadataCache
- [ ] T037 Error handling and user notifications

## Phase 3.5: Advanced Features

- [ ] T038 Bulk import functionality with progress tracking
- [ ] T039 Email thread detection and grouping
- [ ] T040 Attachment handling and extraction
- [ ] T041 Knowledge extraction automation
- [ ] T042 Daily summary caching with TTL
- [ ] T043 Search indexing and performance optimization

## Phase 3.6: Polish

- [ ] T044 [P] Unit tests for email parsing logic in tests/unit/email-parser.test.ts
- [ ] T045 [P] Unit tests for summary generation in tests/unit/summary-generator.test.ts
- [ ] T046 [P] Unit tests for knowledge indexing in tests/unit/knowledge-indexer.test.ts
- [ ] T047 Performance tests for bulk operations (<100 emails/minute)
- [ ] T048 [P] Update plugin documentation in README.md
- [ ] T049 [P] Create user guide based on quickstart.md
- [ ] T050 Code cleanup and optimization
- [ ] T051 Manual testing with real Obsidian vault

## Dependencies

### Critical Path
1. **Setup (T001-T003)** → **Tests (T004-T015)** → **Models (T016-T020)** → **Libraries (T021-T023)** → **Services (T024-T026)**
2. **Services** → **Plugin Integration (T030-T037)** → **Advanced Features (T038-T043)** → **Polish (T044-T051)**

### Specific Blocks
- T004-T015 must complete and FAIL before any T016+ implementation
- T016-T020 (models) block T021-T026 (services)
- T021-T023 (libraries) block T024-T026 (plugin services)
- T024-T026 block T030 (main plugin)
- T030 blocks T031-T037 (plugin features)

## Parallel Execution Examples

### Phase 3.2 - All Contract Tests (Launch Together)
```bash
# All contract tests can run in parallel - different files
npm test tests/contract/email-capture.test.ts &
npm test tests/contract/daily-summary.test.ts &
npm test tests/contract/knowledge-search.test.ts &
npm test tests/contract/bulk-import.test.ts &
npm test tests/contract/email-resolution.test.ts &
wait
```

### Phase 3.3 - Model Creation (Launch Together)
```bash
# All models can be implemented in parallel - different files
touch src/models/EmailInquiry.ts &
touch src/models/DailySummary.ts &
touch src/models/KnowledgeEntry.ts &
touch src/models/ResolutionNote.ts &
touch src/models/Tag.ts &
wait
```

### Phase 3.6 - Unit Tests (Launch Together)
```bash
# All unit tests can run in parallel - different files  
npm test tests/unit/email-parser.test.ts &
npm test tests/unit/summary-generator.test.ts &
npm test tests/unit/knowledge-indexer.test.ts &
wait
```

## Validation Checklist
*GATE: All items must be ✓ before tasks are complete*

- [✓] All contracts have corresponding tests (T004-T011)
- [✓] All entities have model tasks (T016-T020)  
- [✓] All tests come before implementation (T004-T015 before T016+)
- [✓] Parallel tasks truly independent ([P] tasks use different files)
- [✓] Each task specifies exact file path
- [✓] No [P] task modifies same file as another [P] task
- [✓] TDD order strictly enforced (RED-GREEN-Refactor)
- [✓] All functional requirements from spec covered
- [✓] Plugin architecture follows Obsidian best practices

## Task Generation Rules Applied

1. **From Contracts** ✓:
   - plugin-api.yaml → 5 contract tests (T004-T008)
   - cli-commands.md → 3 CLI tests (T009-T011)
   
2. **From Data Model** ✓:
   - 5 entities → 5 model tasks (T016-T020)
   - Services → 6 service tasks (T021-T026)
   
3. **From User Stories** ✓:
   - 4 main workflows → 4 integration tests (T012-T015)
   - Quickstart scenarios → validation tasks (T047-T051)

4. **Ordering Applied** ✓:
   - Setup → Tests → Models → Services → Integration → Polish
   - Dependencies strictly enforced

## Notes
- **[P] tasks**: Different files, no dependencies - safe for parallel execution
- **Test-first mandatory**: T004-T015 must fail before T016+ implementation
- **Commit after each task**: Git history shows TDD progression
- **Constitutional compliance**: Library-first architecture, CLI for each library
- **Performance targets**: 100 emails/minute parsing, <500ms search response
- **Plugin constraints**: <50MB memory, Obsidian 1.4+ compatibility

---
*Generated from plan.md Phase 2 strategy. Ready for implementation execution.*