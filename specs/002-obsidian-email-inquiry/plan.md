# Implementation Plan: Obsidian Email Inquiry Management System

**Branch**: `002-obsidian-email-inquiry` | **Date**: 2025-09-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-obsidian-email-inquiry/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
4. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
5. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file
6. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
7. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
8. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
An Obsidian plugin that captures email inquiry content, organizes them by date, and builds a searchable knowledge base. The system preserves raw email formatting, generates daily summaries, and enables knowledge accumulation through resolution tracking and pattern analysis.

## Technical Context
**Language/Version**: TypeScript 5.x / Node.js 18+  
**Primary Dependencies**: Obsidian API, TypeScript, Node.js filesystem APIs  
**Storage**: Obsidian Vault (markdown files with frontmatter metadata)  
**Testing**: Jest for unit tests, Playwright for integration tests  
**Target Platform**: Obsidian Desktop (Windows/Mac/Linux)  
**Project Type**: single (Obsidian plugin)  
**Performance Goals**: Parse and index 100 emails/minute, search response <500ms  
**Constraints**: <50MB memory footprint, compatible with Obsidian 1.4+  
**Scale/Scope**: Handle 10,000+ email records, support vault sizes up to 1GB

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Simplicity**:
- Projects: 1 (Obsidian plugin)
- Using framework directly? Yes (Obsidian API directly)
- Single data model? Yes (Email entity with metadata)
- Avoiding patterns? Yes (no unnecessary abstractions)

**Architecture**:
- EVERY feature as library? Yes (email-parser, daily-summary, knowledge-base)
- Libraries listed: 
  - email-parser: Parse and structure email content
  - daily-summary: Generate date-based summaries
  - knowledge-base: Index and search accumulated knowledge
- CLI per library: Commands with --help/--version/--format
- Library docs: llms.txt format planned? Yes

**Testing (NON-NEGOTIABLE)**:
- RED-GREEN-Refactor cycle enforced? Yes
- Git commits show tests before implementation? Yes
- Order: Contract→Integration→E2E→Unit strictly followed? Yes
- Real dependencies used? Yes (actual Obsidian vault)
- Integration tests for: new libraries, contract changes, shared schemas? Yes
- FORBIDDEN: Implementation before test, skipping RED phase

**Observability**:
- Structured logging included? Yes
- Frontend logs → backend? N/A (plugin only)
- Error context sufficient? Yes

**Versioning**:
- Version number assigned? 1.0.0
- BUILD increments on every change? Yes
- Breaking changes handled? Yes (migration plan for vault structure changes)

## Project Structure

### Documentation (this feature)
```
specs/002-obsidian-email-inquiry/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
# Option 1: Single project (DEFAULT) - Obsidian Plugin
src/
├── models/
│   ├── EmailInquiry.ts
│   ├── DailySummary.ts
│   └── KnowledgeEntry.ts
├── services/
│   ├── EmailParser.ts
│   ├── SummaryGenerator.ts
│   └── KnowledgeIndexer.ts
├── cli/
│   ├── email-parser-cli.ts
│   ├── summary-cli.ts
│   └── knowledge-cli.ts
└── lib/
    ├── email-parser/
    ├── daily-summary/
    └── knowledge-base/

tests/
├── contract/
├── integration/
└── unit/
```

**Structure Decision**: Option 1 (Single project) - Obsidian plugin with library architecture

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - Email field extraction requirements (sender, subject, date, custom fields)
   - Email thread grouping approach
   - Bulk import sources and formats
   - Inquiry statistics and metrics requirements
   - Data retention policies
   - Expected email volume

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research Obsidian plugin architecture best practices"
     Task: "Research email parsing and metadata extraction patterns"
     Task: "Research markdown frontmatter for structured data storage"
     Task: "Research Obsidian search API capabilities"
   For each technology choice:
     Task: "Find best practices for TypeScript Obsidian plugin development"
     Task: "Find patterns for daily aggregation in note-based systems"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - EmailInquiry: id, sender, subject, body, receivedDate, tags, status
   - DailySummary: date, emailCount, categories, insights
   - KnowledgeEntry: id, source, resolution, tags, linkedEmails
   - Tag: name, color, category
   - ResolutionNote: emailId, content, resolvedDate, outcome

2. **Generate API contracts** from functional requirements:
   - Command palette actions for Obsidian
   - File format specifications for email notes
   - Frontmatter schema for metadata
   - Output to `/contracts/`

3. **Generate contract tests** from contracts:
   - Test email parsing contract
   - Test daily summary generation
   - Test search and indexing
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Capture new email → create note with metadata
   - Request daily summary → aggregate emails by date
   - Search for pattern → return relevant knowledge
   - Add resolution → update knowledge base

5. **Update agent file incrementally**:
   - Run `/scripts/update-agent-context.sh claude`
   - Add Obsidian plugin context
   - Update recent changes
   - Keep under 150 lines

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, CLAUDE.md

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Each contract → contract test task [P]
- Each entity → model creation task [P] 
- Each user story → integration test task
- Implementation tasks to make tests pass

**Ordering Strategy**:
- TDD order: Tests before implementation 
- Dependency order: Models before services before UI
- Mark [P] for parallel execution (independent files)

**Estimated Output**: 25-30 numbered, ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |

## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [ ] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved
- [x] Complexity deviations documented (None)

---
*Based on Constitution v2.1.1 - See `/memory/constitution.md`*