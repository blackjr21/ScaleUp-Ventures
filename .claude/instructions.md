# Claritev PM - Claude Code Instructions

This repository is a project management system for tracking programs, projects, meetings, and todos. Follow these rules and conventions when working in this repository.

---

## Repository Structure Overview

```
Claritev/
├── MASTER-TODOS.md              # Central list of ALL work - SINGLE SOURCE OF TRUTH
├── Programs/[Name]/             # Programs with nested projects
│   ├── program-overview.md
│   ├── todos.md                # Program-level todos
│   └── Projects/[Name]/        # Projects within this program
│       ├── plan.md
│       ├── status.md
│       └── todos.md            # Project-specific todos
├── Projects/[Name]/             # Standalone projects (not in programs)
│   ├── plan.md
│   ├── status.md
│   └── todos.md
├── Meetings/                    # ALL meetings organized by type
│   ├── 1-on-1/YYYY-MM-DD-Person-Topic/
│   ├── Team/YYYY-MM-DD-Team-Topic/
│   └── General/YYYY-MM-DD-Topic/
├── Status/
│   ├── weekly-updates/
│   └── monthly-reports/
└── Resources/templates/         # All templates - USE THESE!
```

---

## CRITICAL RULES - ALWAYS FOLLOW

### 1. Todo Format (REQUIRED)

**ALWAYS use this exact format for todos in MASTER-TODOS.md:**

```markdown
### [Program/Project] Task description
- **Due:** YYYY-MM-DD
- **Priority:** High/Medium/Low
- **Status:** Not Started/In Progress/Blocked/Completed
- **Notes:** Additional context
- **Source:** [Path/To/Source/File.md](Path/To/Source/File.md)
```

**Required Fields:**
- **Due:** Always include (use "TBD" if unknown)
- **Priority:** High/Medium/Low
- **Status:** Not Started/In Progress/Blocked/Completed
- **Notes:** Context, blockers, or details
- **Source:** Clickable link to source file (meeting, status report, project todos, etc.)

**Todo Sections (in order):**
1. Due This Week
2. Due Next Week
3. Due Later
4. Backlog
5. Completed

**Example:**
```markdown
## Due This Week

### [Program-Alpha/Project-1] Complete API integration
- **Due:** 2025-11-24
- **Priority:** High
- **Status:** In Progress
- **Notes:** Waiting on vendor documentation
- **Source:** [Meetings/1-on-1/2025-11-20-Vendor-Sync.md](Meetings/1-on-1/2025-11-20-Vendor-Sync.md)
```

**Source Field Guidelines:**
- Use relative paths from repository root
- Format: `[Path/To/File.md](Path/To/File.md)`
- Creates clickable link to jump back to original context
- For todos from meetings: Link to meeting file
- For todos rolled up from projects: Link to project todos.md
- This allows easy navigation back to full context

### 2. MASTER-TODOS.md is the Single Source of Truth

**ALWAYS:**
- Keep `MASTER-TODOS.md` up to date with ALL work across all programs/projects
- Use `[Program/Project]` prefix for every task in MASTER-TODOS.md
- Roll up important tasks from project-level todos to MASTER-TODOS.md
- Organize by due date sections (Due This Week, Due Next Week, etc.)

**When asked "what work is due":**
- Check MASTER-TODOS.md first
- Look at "Due This Week" section
- Can also search: `grep -r "Due: 2025-11-" . --include="todos.md"`

### 3. Meeting Naming Convention (STRICT)

**Format:** `YYYY-MM-DD-Person/Team-Topic`

**Location based on type:**
- 1-on-1: `Meetings/1-on-1/YYYY-MM-DD-Person-Name-Topic/`
- Team: `Meetings/Team/YYYY-MM-DD-Team-Name-Topic/`
- General: `Meetings/General/YYYY-MM-DD-Topic/`

**Examples:**
- `Meetings/1-on-1/2025-11-17-John-Smith-Performance-Review/`
- `Meetings/Team/2025-11-18-Engineering-Sprint-Planning/`
- `Meetings/General/2025-11-19-Stakeholder-Alignment/`

**Each meeting folder MUST contain:**
- `transcription.md` - Raw meeting transcription
- `notes.md` - Structured meeting notes with action items

### 4. Always Use Templates

**Templates are located in:** `Resources/templates/`

**Available templates:**
- `todos-template.md` - For any todos.md file
- `plan-template.md` - For project plan.md files
- `status-template.md` - For status.md files
- `meeting-notes-template.md` - For meeting notes
- `transcription-template.md` - For meeting transcriptions

**When creating new files, ALWAYS copy from template:**
```bash
cp Resources/templates/todos-template.md [destination]/todos.md
```

### 5. File Locations - WHERE to Add Things

| What | Where |
|------|-------|
| New standalone project | `Projects/[Project-Name]/` |
| New program project | `Programs/[Program]/Projects/[Project-Name]/` |
| 1-on-1 meeting | `Meetings/1-on-1/YYYY-MM-DD-Person-Topic/` |
| Team meeting | `Meetings/Team/YYYY-MM-DD-Team-Topic/` |
| General meeting | `Meetings/General/YYYY-MM-DD-Topic/` |
| Weekly status | `Status/weekly-updates/YYYY-MM-DD-*.md` |
| Monthly report | `Status/monthly-reports/YYYY-MM-DD-*.md` |
| Central todos | `MASTER-TODOS.md` |

---

## Common Workflows - How to Help the User

### When User Asks: "What work is due?"

1. **Check MASTER-TODOS.md** - Look at "Due This Week" section
2. **Show tasks with due dates** this week or overdue
3. **Format output clearly** with due dates, priorities, and project context

### When User Uploads a Meeting Transcription

1. **Create meeting folder** in appropriate location (1-on-1, Team, or General)
2. **Use naming convention:** `YYYY-MM-DD-Person/Team-Topic`
3. **Create transcription.md** using `Resources/templates/transcription-template.md`
4. **Create notes.md** using `Resources/templates/meeting-notes-template.md`
5. **Extract action items** from transcription
6. **Add action items to:**
   - Relevant project `todos.md`
   - `MASTER-TODOS.md` with proper format
7. **Set due dates and priorities** for action items

### When User Creates a New Project

1. **Ask:** Is this standalone or part of a program?
2. **Create folder** in correct location:
   - Standalone: `Projects/[Name]/`
   - Program: `Programs/[Program]/Projects/[Name]/`
3. **Copy templates:**
   - `plan-template.md` → `plan.md`
   - `status-template.md` → `status.md`
   - `todos-template.md` → `todos.md`
4. **Create Meetings subfolder** if needed
5. **Help fill in** plan.md with objectives, scope, timeline
6. **Add initial tasks** to todos.md
7. **Roll up key tasks** to MASTER-TODOS.md

### When User Creates a New Program

1. **Create program structure:**
   ```bash
   mkdir -p Programs/[Name]/{Projects,Meetings,Status}
   ```
2. **Create files:**
   - `program-overview.md` - Program description, goals, stakeholders
   - `todos.md` - Program-level todos (from template)
3. **Help document** program overview
4. **Add program todos** to MASTER-TODOS.md

### When User Asks to Roll Up Todos

1. **Find all todos.md files:**
   ```bash
   find . -name "todos.md" -type f
   ```
2. **For each project todos.md:**
   - Identify high-priority and urgent tasks
   - Copy to MASTER-TODOS.md with `[Program/Project]` prefix
   - Include all metadata (due date, priority, status, notes)
3. **Organize in MASTER-TODOS.md** by due date sections
4. **Remove duplicates** - keep MASTER-TODOS.md clean

### When User Updates Task Status

1. **Update in project todos.md** - Change status, add notes
2. **Update in MASTER-TODOS.md** - Keep synchronized
3. **If completed:**
   - Move to "Completed" section
   - Add completion date
   - Keep in MASTER-TODOS.md for record

---

## Best Practices - Always Follow

### Priority Levels
- **High:** Urgent, blocks other work, must be done soon
- **Medium:** Important but not blocking, scheduled work
- **Low:** Nice to have, can be deferred

### Status Values
- **Not Started:** Task hasn't begun
- **In Progress:** Actively working on it
- **Blocked:** Waiting on something/someone
- **Completed:** Done (move to Completed section with date)

### Date Format
- **ALWAYS use:** YYYY-MM-DD format
- **Never use:** MM/DD/YYYY or other formats
- **Ensures:** Chronological sorting works correctly

### Naming Conventions
- **Use descriptive names:** Clear and specific
- **Avoid abbreviations:** Write full names
- **Use hyphens for spaces:** `My-Project-Name` not `My_Project_Name`
- **Keep consistent:** Follow existing patterns

### Todo Management
- **Always include due dates** - Even if approximate
- **Update status daily** - Keep todos current
- **Archive completed items** - Move to Completed section, don't delete
- **Roll up weekly** - Sync project todos to MASTER-TODOS.md
- **One source of truth** - MASTER-TODOS.md for all work

---

## When User Asks for Status or Reports

### For "What's my status?"
1. **Check MASTER-TODOS.md** - Current work in progress
2. **Look at Status/** - Recent weekly/monthly updates
3. **Summarize:**
   - What's completed this week
   - What's in progress
   - What's blocked
   - What's due soon

### For Weekly Status Update
1. **Create file:** `Status/weekly-updates/YYYY-MM-DD-Weekly-Update.md`
2. **Use template:** `Resources/templates/status-template.md`
3. **Fill in:**
   - Completed items from all projects
   - In progress items with % complete
   - Blockers and risks
   - Planned work for next week

---

## Error Prevention

### NEVER Do This:
- ❌ Create todos without due dates
- ❌ Use inconsistent date formats
- ❌ Skip the MASTER-TODOS.md update
- ❌ Create meetings without proper folder structure
- ❌ Use wrong naming conventions
- ❌ Create files without using templates
- ❌ Forget to add [Program/Project] prefix in MASTER-TODOS.md

### ALWAYS Do This:
- ✅ Use YYYY-MM-DD date format
- ✅ Follow todo format exactly
- ✅ Update MASTER-TODOS.md when adding/updating tasks
- ✅ Use templates from Resources/templates/
- ✅ Follow naming conventions strictly
- ✅ Include all required metadata (due date, priority, status, notes)
- ✅ Keep MASTER-TODOS.md as single source of truth

---

## Quick Commands Reference

### Find all todos:
```bash
find . -name "todos.md" -type f
```

### Search for due dates:
```bash
grep -r "Due: 2025-11-" . --include="todos.md"
```

### List all meetings:
```bash
ls -la Meetings/*/
```

### Create new project (standalone):
```bash
mkdir Projects/[Name]
cp Resources/templates/plan-template.md Projects/[Name]/plan.md
cp Resources/templates/status-template.md Projects/[Name]/status.md
cp Resources/templates/todos-template.md Projects/[Name]/todos.md
```

### Create new meeting folder:
```bash
mkdir Meetings/[Type]/YYYY-MM-DD-Topic
cp Resources/templates/transcription-template.md Meetings/[Type]/YYYY-MM-DD-Topic/transcription.md
cp Resources/templates/meeting-notes-template.md Meetings/[Type]/YYYY-MM-DD-Topic/notes.md
```

---

## Remember

- **MASTER-TODOS.md** is the single source of truth for all work
- **Use templates** for every new file
- **Follow naming conventions** exactly
- **Keep due dates** in YYYY-MM-DD format
- **Update status** regularly
- **Roll up todos** from projects to MASTER-TODOS.md
- **Extract action items** from meetings to todos

When in doubt, check:
1. README.md for detailed how-to guides
2. Resources/templates/ for all templates
3. Existing files for examples of proper format
