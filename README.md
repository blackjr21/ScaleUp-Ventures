# Personal Health Tracker

A personal repository for tracking medical lab results, health metrics, and clinical data over time.

---

## Table of Contents
1. [Repository Structure](#repository-structure)
2. [Getting Started](#getting-started)
3. [How to Add New Lab Results](#how-to-add-new-lab-results)
4. [Generating Reports](#generating-reports)
5. [Understanding Your Data](#understanding-your-data)

---

## Repository Structure

```
Personal/
├── README.md                           # This file
├── Health/                             # Main health data folder
│   ├── Input/                         # Raw input files
│   │   └── Labs/                      # Original lab reports (PDF, images, etc.)
│   ├── Pre-Processing/                # Individual lab results by date
│   │   └── YYYY-MM-DD-Test-Name.md   # Structured lab data
│   ├── Reports/                       # Generated summary reports
│   │   └── YYYY-MM-DD-Summary.md     # Consolidated health summaries
│   ├── Visualizations/                # Charts and graphs
│   │   └── *.png, *.html             # Visual representations of trends
│   └── Scripts/                       # Automation scripts
│       └── *.py                       # Data processing scripts
└── .claude/                           # Claude Code configuration
    ├── instructions.md                # Instructions for AI assistant
    └── agents/                        # Custom agent prompts
```

---

## Getting Started

### 1. Initial Setup

This repository is already set up and ready to use. Your health data is organized in the `Health/` folder.

### 2. Understanding the Workflow

1. **Input**: Add original lab reports to `Health/Input/Labs/`
2. **Process**: Extract data into structured markdown files in `Health/Pre-Processing/`
3. **Analyze**: Generate consolidated reports in `Health/Reports/`
4. **Visualize**: Create charts and trends in `Health/Visualizations/`

---

## How to Add New Lab Results

### Step 1: Save Original Lab Report

```bash
# Add your original lab report (PDF, image, etc.)
cp ~/Downloads/lab-report.pdf Health/Input/Labs/2025-11-19-Lipid-Panel.pdf
```

### Step 2: Create Structured Data File

Create a new markdown file in `Health/Pre-Processing/` with the format:

**Filename format:** `YYYY-MM-DD-Test-Name.md`

**Example:** `2025-11-19-Comprehensive-Metabolic-Panel.md`

**Content template:**
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

## Notes

- Add any relevant notes about the test
- Symptoms at time of test
- Medications or supplements
```

### Step 3: Update Summary Report

Periodically generate updated summary reports that consolidate all lab results.

---

## Generating Reports

### Creating a Consolidated Summary

Your summary reports combine all lab results chronologically and highlight trends.

**Location:** `Health/Reports/YYYY-MM-DD-Medical-Lab-Summary.md`

**What's included:**
- Executive summary of key findings
- Latest results for each test category
- Trend analysis over time
- Abnormal findings flagged
- Clinical interpretations

### Creating Visualizations

Use the Python scripts in `Health/Scripts/` to generate visual reports:

```bash
cd Health/Scripts/
python generate-visualizations.py
```

This creates:
- Trend charts (PNG images)
- Interactive HTML reports
- Comparison graphs across time periods

---

## Understanding Your Data

### Test Categories

Your health data is organized into these categories:

1. **Metabolic Health**
   - Comprehensive Metabolic Panel (CMP)
   - Basic Metabolic Panel (BMP)
   - Hemoglobin A1c (diabetes screening)

2. **Lipid Profile**
   - Total Cholesterol
   - LDL, HDL, Triglycerides
   - Advanced lipid markers (ApoB, NMR Lipoprofile)

3. **Blood Counts**
   - Complete Blood Count (CBC)
   - Iron studies

4. **Hormone Panels**
   - Thyroid function
   - Testosterone
   - Other hormones

5. **Specialized Tests**
   - Arthritis panels
   - Creatine Kinase
   - Urinalysis

### Tracking Trends

Key metrics to monitor over time:
- **HbA1c**: Blood sugar control (goal: <5.7%)
- **Cholesterol**: Cardiovascular risk (goal: varies by individual)
- **Kidney Function**: eGFR and creatinine
- **Blood Pressure**: (add manual tracking if needed)
- **Weight/BMI**: (add manual tracking if needed)

---

## Privacy and Security

**IMPORTANT**: This repository contains sensitive personal health information (PHI).

**Best practices:**
- Do NOT push to public GitHub repositories
- Use private repositories only
- Consider encrypting sensitive files
- Be cautious when sharing or collaborating
- Review .gitignore to exclude sensitive files

---

## Current Health Status Summary

**Last Updated:** November 19, 2025

**Testing Period:** August 2024 - October 2025

**Key Findings:**
- Prediabetes (HbA1c: 5.9%)
- Cholesterol management showing improvement
- Kidney function at upper limit of normal
- All other markers within normal ranges

**Latest Comprehensive Report:**
- [2025-11-19 Medical Lab Summary](Health/2025-11-19-Medical-Lab-Summary.md)

---

## Next Steps

1. **Regular Monitoring**: Schedule follow-up labs every 3-6 months
2. **Trend Analysis**: Review changes over time
3. **Provider Coordination**: Share summaries with healthcare providers
4. **Lifestyle Tracking**: Consider adding diet, exercise, and medication logs

---

## Maintenance

### Weekly Tasks
- Add new lab results as received
- Update any manual health metrics

### Monthly Tasks
- Review trends and patterns
- Generate updated summary if new labs received

### Quarterly Tasks
- Create comprehensive health summary
- Generate trend visualizations
- Back up health data

---

## Questions or Issues?

This repository is managed using Claude Code, an AI-powered development assistant.

For help:
- Ask Claude to generate reports: "Create a summary of my latest labs"
- Request visualizations: "Show me my cholesterol trends"
- Add new data: "Help me add my new lab results from [date]"

---

**Last Repository Update:** November 19, 2025
