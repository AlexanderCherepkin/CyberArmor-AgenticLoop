# Agentic Loop

Multi-agent AI system with hierarchical safety-first architecture.

- **166 agents** across **6 layers**
- Full **ReAct** cycle: user → planning → execution → observability → self-correction → result
- **Three-circuit safety**: `safety-control` → `mutual_check` → `control`
- **Conditional phase routing** via `PhaseTransitionManager`
- **Lazy MCP gateway** for token-efficient tool dispatch

> This README is the entry point for the Agentic Loop runtime. For the CyberArmor/SecureKey website, see [`apps/cyberarmor/README.md`](apps/cyberarmor/README.md).

---

## Repository Layout

```
.
├── .agent_loop/              # Agent specifications (the architecture baseline)
│   ├── TECHNICAL_ASSIGNMENT.md
│   ├── ARCHITECTURE.md
│   ├── main_loop.md          # ReAct head agent
│   ├── orchestrator/         # 6 API routing agents
│   ├── safety-control/       # 9 input-safety agents + 10 mutual_check agents
│   ├── control/              # 7 runtime enforcement agents
│   ├── tooll_subagents/      # 23 ReAct-cycle agents
│   └── tools_*/              # 11 tool categories × ~10 agents each
├── runtime/                  # Python execution engine
│   ├── engine/
│   │   ├── pipeline_runner.py
│   │   ├── llm_engine.py
│   │   └── phase_transition.py
│   ├── main.py               # CLI entry point
│   └── requirements.txt
├── tests/
│   └── integration/
│       └── test_e2e.py
├── scripts/
│   ├── validate_cross_references.js
│   ├── validate_consistency.js
│   └── safety_check.js
├── cli.js                    # Node.js wrapper
├── project_rules.md          # Lightweight policy context
└── README.md                 # This file
```

---

## Quick Start

```bash
# 1. Install Python runtime dependencies
python -m pip install -r runtime/requirements.txt

# 2. Validate runtime without API keys
python -m runtime.main --validate

# 3. Run a deterministic demo using the mock LLM engine
python -m runtime.main --demo --provider mock --max-iterations 3
```

---

## Common Commands

| Command | Purpose |
|---|---|
| `python -m runtime.main --validate` | Validate runtime components (no API calls) |
| `python -m runtime.main --list-agents` | List all loaded agents |
| `python -m runtime.main "your request" --provider mock` | Run with deterministic mock responses |
| `python -m runtime.main "your request" --provider anthropic --model claude-sonnet-4-6` | Run against Anthropic API |
| `pytest` | Run the full Python test suite |
| `node scripts/validate_cross_references.js` | Check agent cross-reference integrity |
| `node scripts/validate_consistency.js` | Check architectural consistency |
| `python -m runtime.main --validate` | Runtime self-check |

---

## Architecture Summary

```
User Request → main_loop.md
  → orchestrator/router.md
    → safety-control/
      → safety-control/mutual_check/
        → control/
          → orchestrator/dispatcher.md
            → tooll_subagents/user/
            → tooll_subagents/planning/
            → tooll_subagents/execution/ → tools_* / tools_browser /
            → tooll_subagents/observability/
            → tooll_subagents/self_correction/ → PhaseTransitionManager
            → tooll_subagents/result/
  → User Response
```

| Layer | Count |
|---|---|
| main_loop | 1 |
| orchestrator | 6 |
| safety-control | 9 |
| safety-control/mutual_check | 10 |
| control | 7 |
| tooll_subagents | 23 |
| tools_* | 110 |
| **Total** | **166** |

---

## Validation

The codebase ships with integrity validators. Run them before committing:

```bash
node .agent_loop/scripts/validate_cross_references.js
node .agent_loop/scripts/validate_consistency.js
python -m runtime.main --validate
pytest
```

---

## Notes

- Agent specs are Markdown files in `.agent_loop/` using the **Algorithmic template**.
- Directory names preserve historical quirks: `tooll_subagents` (double "l") and `tools_manangr` (typo) are intentional.
- `project_rules.md` is loaded by the runtime as fallback policy; updates require approval through `human_approval.md`.
