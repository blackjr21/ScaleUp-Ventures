# Personal AI Enablement - Claude Code Instructions

This repository is a comprehensive personal data management system for tracking health, financial, family, and shopping information. Follow these rules and conventions when working in this repository.

---

## Repository Structure Overview

```
Personal/
├── README.md                          # Main documentation
├── Health/                            # Health data tracking
│   ├── HEALTH-GOALS.md               # Health goals and action items
│   ├── Input/
│   │   ├── Labs/                     # NEW lab PDFs to process (*.pdf)
│   │   └── Pre-Processing/           # Individual lab results by date
│   │       └── YYYY-MM-DD-Test-Name.md  # Structured lab data
│   ├── Reports/                      # Consolidated health summaries
│   │   ├── Medical-Lab-Summary-KISS.html  # Master HTML summary
│   │   └── YYYY-MM-DD-Summary.md    # Other summary reports
│   └── Visualizations/               # Charts, graphs, HTML reports
├── Financial/                         # Financial management
│   ├── Cash Flow Forecasts/          # Cash flow forecasting system
│   │   ├── data/cash-flow-data.md   # Transaction rules database
│   │   ├── forecasts/               # Generated forecasts and dashboard
│   │   ├── src/                     # JavaScript utilities
│   │   ├── docs/                    # Documentation
│   │   └── temp/input/              # Bank statement PDFs
│   └── (future financial domains)
├── Family/                            # Family planning and activities
│   └── C3/                           # Custodial account research
├── Shopping/                          # Shopping research and comparisons
│   └── Random/                       # Product comparisons
└── .claude/                           # Claude Code configuration
    ├── instructions.md                # This file
    └── agents/                        # Custom agent prompts
```

---

## CRITICAL RULES - ALWAYS FOLLOW

### 1. Privacy and Security (TOP PRIORITY)

**NEVER:**
- ❌ Suggest committing PHI (Protected Health Information) to public repositories
- ❌ Share or expose sensitive health data
- ❌ Include real patient names in examples
- ❌ Post health data to external services without explicit permission

**ALWAYS:**
- ✅ Remind user about privacy when handling sensitive data
- ✅ Use .gitignore to protect actual health records
- ✅ Keep repository private
- ✅ Anonymize data in examples

### 2. File Naming Conventions (STRICT)

**Date format:** YYYY-MM-DD (always)
- ✅ `2025-11-19-Lipid-Panel.md`
- ❌ `11-19-2025-Lipid-Panel.md`
- ❌ `Nov-19-Lipid-Panel.md`

**Lab result files:** `YYYY-MM-DD-Test-Name.md`
- Examples:
  - `2025-11-19-Comprehensive-Metabolic-Panel.md`
  - `2025-10-28-Lipid-Panel.md`
  - `2025-07-15-Complete-Blood-Count.md`

**Summary reports:** `YYYY-MM-DD-Medical-Lab-Summary.md`
- Located in: `Health/Reports/`
- Example: `2025-11-19-Medical-Lab-Summary.md`

### 3. Lab Result Format (REQUIRED)

**Template structure for individual lab files:**

```markdown
# [Test Name]

**Test Date:** YYYY-MM-DD
**Ordering Provider:** Dr. [Name]
**Lab:** [Lab Name]
**Fasting:** Yes/No

---

## Results

| Test | Result | Units | Reference Range | Status |
|------|--------|-------|-----------------|--------|
| Glucose | 112 | mg/dL | 70-99 | HIGH |
| Creatinine | 1.26 | mg/dL | 0.76-1.27 | Normal |

---

## Clinical Interpretation

[Any provider notes or interpretations]

---

## Notes

- Relevant context about the test
- Symptoms at time of test
- Current medications or supplements
- Any unusual circumstances
```

**Status indicators:**
- `HIGH` - Above reference range
- `LOW` - Below reference range
- `CRITICAL` - Dangerously abnormal
- `Normal` - Within reference range

### 4. Health Goals Format (HEALTH-GOALS.md)

**Structure:**
1. Current Health Priorities (with action items)
2. Upcoming Appointments
3. Lab Testing Schedule
4. Lifestyle Goals
5. Provider Communication
6. Progress Tracking

**Action item format:**
```markdown
- [ ] Task description
- [x] Completed task
```

**Priority format:**
```markdown
### 1. [Health Priority Name]
- **Status:** Active/Monitoring/Resolved
- **Latest Result:** [Value and date]
- **Goal:** [Target value or outcome]
- **Target Date:** [When to reassess]

**Action Items:**
- [ ] Specific action to take
- [ ] Another action
```

---

## Common Workflows - How to Help the User

### When User Uploads New Lab Results

1. **Ask for key information:**
   - Test date
   - Type of test
   - Ordering provider
   - Whether it was fasting

2. **Create structured file:**
   - Filename: `Health/Pre-Processing/YYYY-MM-DD-Test-Name.md`
   - Use lab result format template
   - Extract data into table format
   - Flag abnormal results

3. **Update Medical-Lab-Summary-KISS.html:**
   - Location: `Health/Reports/Medical-Lab-Summary-KISS.html`
   - Add new lab results to appropriate sections
   - Update "Most Recent Labs" date in header
   - Update relevant trend tables with new data points
   - Flag any new abnormal values
   - Update "Complete Test History" table chronologically
   - Recalculate trends (worsening, improving, stable)

4. **Update Active Problems section if needed:**
   - Add new problems if concerning results found
   - Update action items based on new findings
   - Modify current medications if changed

### When User Requests Health Summary

1. **Analyze all lab files** in `Health/Pre-Processing/`
2. **Group by category:**
   - Metabolic Health (glucose, HbA1c, kidney function)
   - Lipid Profile (cholesterol, triglycerides)
   - Blood Counts (CBC, iron studies)
   - Hormone Panels (thyroid, testosterone)
   - Specialized Tests (other)

3. **Create summary report:**
   - Location: `Health/Reports/YYYY-MM-DD-Medical-Lab-Summary.md`
   - Include executive summary
   - Show latest results for each category
   - Highlight trends over time
   - Flag all abnormal findings
   - Provide clinical context

### When User Asks About Trends

1. **Identify the metric** (e.g., HbA1c, cholesterol, creatinine)
2. **Search through lab files** for all instances
3. **Present chronologically:**
   ```
   HbA1c Trend:
   - 2025-10-28: 5.9% (Prediabetes range)
   - 2025-07-15: 5.7% (Borderline)
   - 2025-01-08: 5.5% (Normal)

   Trend: Increasing ⚠️ - Requires attention
   ```

4. **Suggest actions** based on trends:
   - If improving: Acknowledge progress
   - If worsening: Suggest discussing with provider
   - If stable: Recommend continued monitoring

### When User Sets Health Goals

1. **Add to HEALTH-GOALS.md** under appropriate section
2. **Make goals SMART:**
   - Specific: "Reduce HbA1c to <5.7%"
   - Measurable: Exact values
   - Achievable: Based on current status
   - Relevant: Related to health conditions
   - Time-bound: Include target dates

3. **Create action items:**
   - Break down into concrete steps
   - Include lifestyle changes
   - Schedule follow-up tests
   - Note provider recommendations

4. **Set up tracking:**
   - Define what to measure
   - Determine frequency
   - Note where to record data

### When User Needs Visualization

1. **Check existing visualizations** in `Health/Visualizations/`
2. **Suggest using Scripts:**
   - Point to relevant Python script
   - Offer to help modify script
   - Explain how to run it

3. **For new visualizations:**
   - Ask what metric to visualize
   - Suggest chart type (line graph for trends, bar chart for comparisons)
   - Help create or modify script

---

## Data Categories - Understanding Health Data

### Metabolic Health
**Common tests:**
- Comprehensive Metabolic Panel (CMP)
- Basic Metabolic Panel (BMP)
- Hemoglobin A1c (HbA1c)
- Fasting Glucose

**Key metrics to track:**
- Glucose levels (diabetes screening)
- HbA1c (long-term glucose control)
- Kidney function (creatinine, eGFR)
- Liver enzymes (AST, ALT)
- Electrolytes (sodium, potassium)

### Lipid Profile
**Common tests:**
- Standard Lipid Panel
- Advanced Lipid Panel
- Apolipoprotein B (ApoB)
- NMR Lipoprofile

**Key metrics:**
- Total Cholesterol
- LDL Cholesterol (bad)
- HDL Cholesterol (good)
- Triglycerides
- Non-HDL Cholesterol
- ApoB (advanced marker)

### Blood Counts
**Common tests:**
- Complete Blood Count (CBC)
- Iron Studies
- Ferritin

**Key metrics:**
- Hemoglobin
- Hematocrit
- White blood cells
- Platelets
- Iron, TIBC

### Hormone Panels
**Common tests:**
- Thyroid Panel (TSH, T3, T4)
- Testosterone (Total, Free)
- Vitamin D
- Cortisol

**Key metrics:**
- TSH (thyroid function)
- Free T3, Free T4
- Total and Free Testosterone
- 25-OH Vitamin D

---

## Best Practices - Always Follow

### When Handling Lab Data

1. **Verify accuracy:**
   - Double-check values when entering data
   - Confirm units (mg/dL vs mmol/L)
   - Verify reference ranges match lab's standards

2. **Preserve context:**
   - Note if fasting or non-fasting
   - Record time of day if relevant
   - Document medications taken
   - Note any symptoms

3. **Flag abnormals:**
   - Clearly mark HIGH or LOW
   - Note CRITICAL values
   - Suggest provider follow-up for concerning results

### When Creating Reports

1. **Executive summary first:**
   - Most significant findings at the top
   - Overall health status
   - Critical items that need attention

2. **Organize by body system:**
   - Metabolic health
   - Cardiovascular (lipids)
   - Blood counts
   - Hormones
   - Other

3. **Show trends:**
   - Compare to previous results
   - Note improvement or decline
   - Indicate stability

4. **Clinical context:**
   - Explain what values mean
   - Relate to health conditions
   - Suggest next steps

### When Setting Goals

1. **Base on current data:**
   - Use actual lab values
   - Consider trends
   - Set realistic targets

2. **Include provider input:**
   - Note provider recommendations
   - Respect medical advice
   - Don't diagnose or prescribe

3. **Create actionable steps:**
   - Specific lifestyle changes
   - Measurable behaviors
   - Scheduled follow-ups

---

## Privacy Reminders

**Always remind user when:**
- Creating files with real health data
- Suggesting git commits with PHI
- Exporting or sharing reports
- Adding visualizations with real values

**Standard privacy reminder:**
```
⚠️ Privacy Notice: This file contains personal health information.
Ensure this repository remains private and is not pushed to public repositories.
```

---

## Quick Reference Commands

### Find all lab results:
```bash
ls -la Health/Pre-Processing/
```

### Search for specific test:
```bash
grep -r "Lipid Panel" Health/Pre-Processing/
```

### List all summary reports:
```bash
ls -la Health/Reports/
```

### View visualizations:
```bash
ls -la Health/Visualizations/
```

### Find labs by date range:
```bash
ls Health/Pre-Processing/ | grep "2025-10"
```

---

## When User Asks Common Questions

### "What are my latest results?"
1. Check `Health/Reports/` for most recent summary
2. If no recent summary, check latest files in `Health/Pre-Processing/`
3. Present in organized format by category

### "What's my cholesterol trend?"
1. Search for "Lipid Panel" files
2. Extract cholesterol values chronologically
3. Show trend with dates and values
4. Note if improving, stable, or worsening

### "When are my next labs due?"
1. Check HEALTH-GOALS.md → Lab Testing Schedule
2. List upcoming tests with target dates
3. Note what prep is needed (fasting, etc.)

### "What should I discuss with my doctor?"
1. Check HEALTH-GOALS.md → Provider Communication
2. List questions already noted
3. Suggest adding items based on recent results
4. Highlight any concerning trends

---

## Remember

- **Privacy first** - Always protect health information
- **Accuracy matters** - Double-check values and units
- **Context is key** - Include dates, fasting status, medications
- **Trends over time** - Single values less important than patterns
- **Provider guidance** - Support medical care, don't replace it
- **User empowerment** - Help user understand and track their health

This is a personal health tool to:
- Organize medical data
- Track trends over time
- Prepare for provider visits
- Monitor health goals
- Maintain continuity of care

NOT to:
- Diagnose conditions
- Prescribe treatments
- Replace medical advice
- Make clinical decisions

When in doubt, suggest consulting with healthcare provider.

---

## Financial Domain - Cash Flow Forecasting

### Overview

The Financial/Cash Flow Forecasts/ system provides automated cash flow projection and bill management using specialized AI agents.

### Agent System

**6 Specialized Agents** (located in `.claude/agents/`):
1. `cash-flow-forecaster.md` - Main orchestrator agent
2. `bill-confirmation-agent.md` - Confirms bill payment status
3. `forecast-calculator.md` - Pure calculation engine
4. `report-formatter.md` - Generates markdown reports
5. `dashboard-updater.md` - Updates HTML dashboard
6. `bank-reconciler.md` - Reconciles bank statements

### Critical Path Conventions

**All file paths are absolute from repository root:**
- Data file: `Financial/Cash Flow Forecasts/data/cash-flow-data.md`
- Dashboard: `Financial/Cash Flow Forecasts/forecasts/dashboard.html`
- Bank PDFs: `Financial/Cash Flow Forecasts/temp/input/`
- Reports: `Financial/Cash Flow Forecasts/forecasts/`

**NEVER use relative paths** like `data/cash-flow-data.md` in agent configurations.

### Key Features

- **60-day cash flow projections** with day-by-day balance tracking
- **Interactive HTML dashboard** with dark mode support
- **Bill payment confirmation** workflow with user interaction
- **Bank statement reconciliation** for missing recurring transactions
- **Alert system** for negative and low balance days
- **Actionable suggestions** for payment timing optimization

### Working with Cash Flow System

**To generate a forecast:**
- Provide: Today's date (YYYY-MM-DD) and current balance
- Agent will confirm bills paid month-to-date
- System calculates rest of month + next full month
- Outputs markdown report + updates dashboard

**To reconcile bank statements:**
- Place PDF statements in `Financial/Cash Flow Forecasts/temp/input/`
- Invoke bank-reconciler agent
- Review missing recurring transactions
- Approve additions to tracking file

### Privacy & Security

- Financial data contains sensitive banking information
- Keep `Financial/Cash Flow Forecasts/data/cash-flow-data.md` private
- Do NOT commit actual account numbers or routing info
- Dashboard is local HTML - safe for personal use

---

## Family & Shopping Domains

### Family Planning
- **C3 subfolder:** Custodial account (UTMA/UGMA) research and comparisons
- **Planning docs:** Activities like swim lessons, education planning
- Privacy: May contain children's information - treat with care

### Shopping Research
- **Random subfolder:** Product comparisons and purchase research
- Format: Markdown comparison tables with pros/cons
- No sensitive data typically

---

## Multi-Domain Principles

### When to Use Which Domain

**Health:** Medical labs, test results, health goals, provider visits
**Financial:** Cash flow, bill tracking, bank reconciliation, forecasts
**Family:** Child-related planning, education, activities, custodial accounts
**Shopping:** Product research, price comparisons, purchase decisions

### Adding New Domains

To add a new domain (e.g., Investments, Taxes):
1. Create top-level folder: `New-Domain/`
2. Add README.md with structure and purpose
3. Update this instructions file with domain-specific rules
4. Create agents if automation needed (in `.claude/agents/`)
5. Use absolute paths from repository root

### Cross-Domain Data

Some information may span domains:
- Health insurance premiums → Health + Financial
- 529 education savings → Family + Financial
- Medical equipment purchases → Health + Shopping

Document cross-references in relevant READMEs.

---

**Last Updated:** November 21, 2025
