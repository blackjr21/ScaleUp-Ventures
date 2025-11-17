# Claritev PM

Project management repository for tracking programs, projects, meetings, and todos.

---

## Table of Contents
1. [Repository Structure](#repository-structure)
2. [Getting Started](#getting-started)
3. [Daily Workflow](#daily-workflow)
4. [How-To Guides](#how-to-guides)
5. [Templates Reference](#templates-reference)
6. [Best Practices](#best-practices)

---

## Repository Structure

```
Claritev/
├── MASTER-TODOS.md              # Central list of all work across programs/projects
├── Background-Context/          # Project context and definitions
├── Programs/                    # Programs with nested projects
│   └── [Program-Name]/
│       ├── program-overview.md  # Program description and goals
│       ├── todos.md            # Program-level todos
│       ├── Projects/
│       │   └── [Project-Name]/
│       │       ├── plan.md     # Project plan
│       │       ├── status.md   # Current status
│       │       └── todos.md    # Project-specific todos
│       ├── Meetings/           # Program-specific meetings
│       └── Status/             # Program status updates
├── Projects/                    # Standalone projects (not in programs)
│   └── [Project-Name]/
│       ├── plan.md
│       ├── status.md
│       ├── todos.md
│       └── Meetings/           # Project-specific meetings
├── Meetings/                    # All meetings organized by type
│   ├── 1-on-1/
│   │   └── YYYY-MM-DD-Person-Name-Topic/
│   │       ├── transcription.md
│   │       └── notes.md
│   ├── Team/
│   │   └── YYYY-MM-DD-Team-Name-Topic/
│   │       ├── transcription.md
│   │       └── notes.md
│   └── General/                # Cross-functional, ad-hoc meetings
│       └── YYYY-MM-DD-Topic/
│           ├── transcription.md
│           └── notes.md
├── Status/                      # Status reports and updates
│   ├── weekly-updates/
│   └── monthly-reports/
└── Resources/                   # Templates and references
    ├── templates/              # All templates
    └── references/             # Links, docs, etc.
```

---

## Getting Started

### 1. Remove Example Files (First Time Setup)
```bash
# Remove example program and project
rm -rf Programs/Example-Program
rm -rf Projects/Example-Standalone-Project

# Update MASTER-TODOS.md to remove example tasks
```

### 2. Create Your First Program
```bash
# Navigate to Programs folder
cd Programs/

# Create new program folder
mkdir My-Program-Name

# Copy templates
cp ../Resources/templates/todos-template.md My-Program-Name/todos.md

# Create program overview
touch My-Program-Name/program-overview.md

# Create necessary subfolders
mkdir -p My-Program-Name/{Projects,Meetings,Status}
```

**Then edit:**
- `My-Program-Name/program-overview.md` - Add program description, goals, stakeholders
- `My-Program-Name/todos.md` - Add program-level tasks

### 3. Create Your First Project

**For a standalone project:**
```bash
cd Projects/
mkdir My-Project-Name
cp ../Resources/templates/plan-template.md My-Project-Name/plan.md
cp ../Resources/templates/status-template.md My-Project-Name/status.md
cp ../Resources/templates/todos-template.md My-Project-Name/todos.md
mkdir My-Project-Name/Meetings
```

**For a project within a program:**
```bash
cd Programs/My-Program-Name/Projects/
mkdir My-Project-Name
cp ../../../Resources/templates/plan-template.md My-Project-Name/plan.md
cp ../../../Resources/templates/status-template.md My-Project-Name/status.md
cp ../../../Resources/templates/todos-template.md My-Project-Name/todos.md
```

**Then edit:**
- `plan.md` - Define objectives, scope, timeline, stakeholders
- `status.md` - Initial status (usually "Planning" phase)
- `todos.md` - Add project tasks

---

## Daily Workflow

### Morning Routine
1. **Check what's due today**
   - Open `MASTER-TODOS.md`
   - Review "Due This Week" section
   - Identify today's priorities

2. **Review meeting schedule**
   - Check calendar for meetings today
   - Prepare meeting folders if needed

### After Each Meeting
1. **Create meeting folder**
   ```bash
   # Example: 1-on-1 meeting
   cd Meetings/1-on-1/
   mkdir 2025-11-17-John-Smith-Performance-Review
   cd 2025-11-17-John-Smith-Performance-Review/
   ```

2. **Add transcription**
   - Copy `Resources/templates/transcription-template.md` to `transcription.md`
   - Paste meeting transcription
   - Add quick summary and key quotes

3. **Create meeting notes**
   - Copy `Resources/templates/meeting-notes-template.md` to `notes.md`
   - Document key discussion points
   - List action items with owners and due dates

4. **Update todos**
   - Add action items to relevant project `todos.md`
   - Update `MASTER-TODOS.md` with new tasks
   - Set due dates and priorities

### End of Day
1. **Update task status**
   - Mark completed tasks in project `todos.md`
   - Update status in `MASTER-TODOS.md`
   - Move completed items to "Completed" section

2. **Plan tomorrow**
   - Review "Due This Week" in `MASTER-TODOS.md`
   - Prioritize tasks for tomorrow

### Weekly Routine

**Every Friday:**
1. **Create weekly status update**
   ```bash
   cd Status/weekly-updates/
   cp ../../Resources/templates/status-template.md 2025-11-22-Weekly-Update.md
   ```

2. **Document the week**
   - List completed items from all projects
   - Update blockers and risks
   - Plan next week's priorities

3. **Clean up todos**
   - Archive completed items
   - Update priorities
   - Adjust due dates if needed

---

## How-To Guides

### How to Track a New Task

**Step 1: Determine the scope**
- Is it program-level, project-level, or general work?

**Step 2: Add to the appropriate todos.md**

For project task:
```bash
# Navigate to project
cd Projects/My-Project-Name/
# or
cd Programs/My-Program/Projects/My-Project/

# Edit todos.md
# Add task under appropriate section (Due This Week, Due Next Week, etc.)
```

**Step 3: Add to MASTER-TODOS.md**
```bash
# Open MASTER-TODOS.md
# Add task with [Program/Project] prefix
```

**Example:**
```markdown
### [Program-Alpha/Project-1] Complete API integration
- **Due:** 2025-11-24
- **Priority:** High
- **Status:** In Progress
- **Notes:** Waiting on vendor documentation
```

### How to Upload Daily Transcriptions

**Step 1: Create meeting folder**
```bash
cd Meetings/[Type]/  # 1-on-1, Team, or General
mkdir YYYY-MM-DD-Person-or-Topic
```

**Step 2: Add transcription**
```bash
cp ../../Resources/templates/transcription-template.md YYYY-MM-DD-Person-or-Topic/transcription.md
```

**Step 3: Paste transcription and add metadata**
- Fill in date, attendees, duration
- Paste raw transcription
- Add quick summary
- List follow-up items

**Step 4: Create notes from transcription**
```bash
cp ../../Resources/templates/meeting-notes-template.md YYYY-MM-DD-Person-or-Topic/notes.md
```

**Step 5: Extract action items to todos**
- Review action items from notes
- Add to relevant project todos.md
- Update MASTER-TODOS.md

### How to Find What Work is Due

**Option 1: Check MASTER-TODOS.md**
```bash
# Open MASTER-TODOS.md
# Look at "Due This Week" section
# All tasks are listed with due dates
```

**Option 2: Search by date**
```bash
# From repository root
grep -r "Due: 2025-11-" . --include="todos.md"
```

**Option 3: Check specific project**
```bash
# Navigate to project
cd Projects/My-Project/
# or
cd Programs/My-Program/Projects/My-Project/

# Open todos.md
# Check "Due This Week" and "Due Next Week" sections
```

### How to Roll Up Todos to MASTER-TODOS.md

**Weekly rollup process:**

1. **Review all project todos**
   ```bash
   # List all project todos
   find . -name "todos.md" -type f
   ```

2. **For each project todos.md:**
   - Copy high-priority tasks to MASTER-TODOS.md
   - Use format: `[Program/Project] Task description`
   - Include due date, priority, status, notes

3. **Organize in MASTER-TODOS.md by due date:**
   - Due This Week
   - Due Next Week
   - Due Later
   - Backlog

**Example workflow:**
```bash
# 1. Check project todo
cat Projects/Project-X/todos.md

# 2. Copy important task to MASTER-TODOS.md with prefix
# Before: "Complete API integration"
# After: "[Project-X] Complete API integration"

# 3. Ensure due dates and priorities are aligned
```

### How to Create a Program with Multiple Projects

**Step 1: Create program structure**
```bash
cd Programs/
mkdir My-New-Program
cd My-New-Program/

# Create program files
cp ../../Resources/templates/todos-template.md todos.md
touch program-overview.md

# Create folders
mkdir -p Projects Meetings Status
```

**Step 2: Document program overview**
Edit `program-overview.md`:
- Program purpose and goals
- List of projects in the program
- Key stakeholders
- Success metrics

**Step 3: Create first project**
```bash
cd Projects/
mkdir First-Project

# Copy templates
cp ../../../Resources/templates/plan-template.md First-Project/plan.md
cp ../../../Resources/templates/status-template.md First-Project/status.md
cp ../../../Resources/templates/todos-template.md First-Project/todos.md
```

**Step 4: Add program and project todos to MASTER-TODOS.md**

### How to Update Project Status

**Step 1: Navigate to project**
```bash
cd Projects/My-Project/
# or
cd Programs/My-Program/Projects/My-Project/
```

**Step 2: Open status.md**
```bash
# Edit the file and update:
# - Date and period
# - Executive summary
# - Progress (Completed, In Progress, Planned)
# - Blockers and risks
# - Next steps
```

**Step 3: Create weekly status if needed**
```bash
# For weekly updates
cp status.md ../../Status/weekly-updates/2025-11-22-My-Project-Update.md
```

---

## Templates Reference

### Where are templates located?
`Resources/templates/`

### Available Templates

| Template | Use For | Location |
|----------|---------|----------|
| `todos-template.md` | Tracking tasks | Program/Project todos |
| `plan-template.md` | Project planning | Project plan.md |
| `status-template.md` | Status updates | Project status.md or Status/ folder |
| `meeting-notes-template.md` | Meeting documentation | Meeting folders |
| `transcription-template.md` | Meeting transcriptions | Meeting folders |

### How to Use Templates

**Copy template to destination:**
```bash
cp Resources/templates/[template-name] [destination]/[new-name]
```

**Examples:**
```bash
# New project plan
cp Resources/templates/plan-template.md Projects/New-Project/plan.md

# New meeting notes
cp Resources/templates/meeting-notes-template.md Meetings/Team/2025-11-17-Sprint-Planning/notes.md
```

---

## Best Practices

### Todo Management
1. **Always include due dates** - Even if approximate
2. **Use priority levels consistently**
   - High: Urgent, blocks other work
   - Medium: Important but not blocking
   - Low: Nice to have, can be deferred
3. **Update status regularly** - At least daily
4. **Archive completed items** - Move to "Completed" section with completion date
5. **Roll up to MASTER-TODOS weekly** - Ensures nothing is missed

### Meeting Documentation
1. **Create folder immediately after meeting** - Don't wait
2. **Upload transcription same day** - While context is fresh
3. **Extract action items within 24 hours** - Add to todos
4. **Use consistent naming** - YYYY-MM-DD-Person/Topic format
5. **Link related meetings** - Reference previous meetings in notes

### Project Planning
1. **Start with plan.md** - Define scope before starting work
2. **Update status.md weekly** - Keep stakeholders informed
3. **Review todos.md daily** - Stay on track
4. **Keep program overview current** - Update as projects are added/completed

### File Organization
1. **Use descriptive names** - Avoid abbreviations
2. **Date format: YYYY-MM-DD** - Ensures chronological sorting
3. **Keep folder structure flat** - Don't nest too deeply
4. **One source of truth** - MASTER-TODOS.md for all work

---

## Quick Reference: File Locations

### Where do I add...

| What | Where | Template |
|------|-------|----------|
| New standalone project | `Projects/[Project-Name]/` | plan, status, todos templates |
| New program project | `Programs/[Program]/Projects/[Project-Name]/` | plan, status, todos templates |
| 1-on-1 meeting | `Meetings/1-on-1/YYYY-MM-DD-Person-Topic/` | meeting-notes, transcription templates |
| Team meeting | `Meetings/Team/YYYY-MM-DD-Team-Topic/` | meeting-notes, transcription templates |
| General meeting | `Meetings/General/YYYY-MM-DD-Topic/` | meeting-notes, transcription templates |
| Weekly status | `Status/weekly-updates/` | status-template |
| Monthly report | `Status/monthly-reports/` | status-template |
| Program overview | `Programs/[Program-Name]/program-overview.md` | Custom |
| Central todos | `MASTER-TODOS.md` | See existing format |

---

## Need Help?

- Check `Resources/templates/` for all templates
- Review example files in repository (if not deleted)
- See individual folder README files for specific guidance

---

**Last Updated:** 2025-11-17