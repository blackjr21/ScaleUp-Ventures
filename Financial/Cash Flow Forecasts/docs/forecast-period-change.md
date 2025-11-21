# Cash Flow Forecaster - Adaptive Period Change

**Date:** November 19, 2025
**Change:** Modified forecast period from fixed 90 days to adaptive "Current Month + Next Month"

## Rationale

The new adaptive approach provides:
1. **Relevant timeframe:** Always shows the complete current billing cycle
2. **Next month visibility:** Full view of upcoming month for planning
3. **Reduced data:** 30-60 days instead of 90 makes dashboard faster and more focused
4. **Better UX:** Users care most about this month and next month, not 3 months out

## How It Works

### Calculation Logic
- **Start date:** Today (user-provided)
- **End date:** Last day of next month
- **Duration:** Varies by when forecast is run

### Examples

| Today's Date | Forecast Period          | Total Days |
|--------------|--------------------------|------------|
| Nov 19, 2025 | Nov 19 - Dec 31         | 43 days    |
| Nov 30, 2025 | Nov 30 - Dec 31         | 32 days    |
| Jan 2, 2026  | Jan 2 - Feb 28          | 58 days    |
| Feb 28, 2026 | Feb 28 - Mar 31         | 32 days    |

## Changes Made

### 1. Agent Instructions (`cash-flow-forecaster.md`)
- Updated forecast period description
- Changed from "60-90 days" to "rest of current month + next full month"
- Added examples showing adaptive behavior
- Updated data array comments to reflect variable length
- Adjusted chart data points from 18-20 to 10-15

### 2. Dashboard (`dashboard.html`)
- Updated title: "DETAILED TRANSACTIONS (Current + Next Month)"
- Updated summary: "Forecast Summary (Current + Next Month)"
- No structural changes needed (JavaScript already handles variable-length arrays)

### 3. Output Format
- Markdown report still shows same structure
- Summary section now shows adaptive date range
- All 7 sections remain the same

## Benefits

### For Users
- ✅ See complete current billing cycle
- ✅ Plan for entire next month
- ✅ Faster dashboard load times
- ✅ More focused attention on immediate timeframe

### For Agent
- ✅ Less calculation overhead
- ✅ More accurate near-term predictions
- ✅ Easier to spot patterns in 1-2 months vs 3 months

## Migration Notes

**No breaking changes:**
- Existing dashboard structure supports any data length
- Month separators work automatically
- Chart scales to any dataset size
- All styling remains unchanged

**Backward compatible:**
- Old 60-day or 90-day data will still render correctly
- Next forecast run will update to new adaptive period
