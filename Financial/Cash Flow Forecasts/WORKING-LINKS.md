# ✅ Working Links for Your Financial Tools

## 🌐 All Links (Servers Must Be Running)

### Cash Flow Forecasting System
**Port 8080** - Cash Flow Pages

1. **Home / Index Page**
   ```
   http://localhost:8080/index.html
   ```
   Main landing page with links to all tools

2. **Dashboard**
   ```
   http://localhost:8080/dashboard.html
   ```
   42-day cash flow forecast with visual insights

3. **Scenario Planner**
   ```
   http://localhost:8080/scenario-planner.html
   ```
   Compare "what-if" scenarios by toggling expenses

### Debt Payoff Strategy
**Port 8000** - Debt Strategy Page

4. **Debt Strategy (Complete)**
   ```
   http://localhost:8000/debt-strategy-complete.html
   ```
   ⭐ **THIS IS THE WORKING LINK** ⭐
   Complete debt payoff strategy with all your data

---

## 🚀 How to Access

### Step 1: Ensure Servers Are Running

You need TWO servers running in separate terminal windows:

**Terminal 1 - Cash Flow Server:**
```bash
cd "/Users/calvinwilliamsjr/Personal AI Enablement/Personal/Financial/Cash Flow Forecasts/forecasts"
python3 -m http.server 8080
```

**Terminal 2 - Debt Payoff Server:**
```bash
cd "/Users/calvinwilliamsjr/Personal AI Enablement/Personal/Financial/Debt Payoff"
python3 -m http.server 8000
```

### Step 2: Open Link in Browser

**For Debt Strategy (the one you want):**

Copy and paste this into your browser:
```
http://localhost:8000/debt-strategy-complete.html
```

**DO NOT** open the file directly from Finder (file:// URLs won't work)
**MUST** use the http://localhost:8000/ URL

---

## ⚠️ Important Notes

### Why File Paths Don't Work
When you see this in your browser:
```
file:///Users/calvinwilliamsjr/Personal%20AI%20Enablement/Personal/Financial/Debt%20Payoff/debt-strategy-final-2025-11-21.html
```

This will show the error:
> "Unable to load dynamic data. Please ensure debt-inventory-current.json is in the same directory."

**Why?** Browsers block JavaScript from loading local JSON files when using `file://` protocol due to security restrictions (CORS policy).

**Solution:** Use the HTTP server link instead:
```
http://localhost:8000/debt-strategy-complete.html
```

### Navigation Between Pages
From any Cash Flow page (Index, Dashboard, or Scenario Planner), clicking "Debt Strategy" in the navigation bar will:
- Open a NEW TAB
- Navigate to: `http://localhost:8000/debt-strategy-complete.html`
- Load all your debt data automatically

---

## 📸 Visual Proof

The Playwright automated tests have proven all navigation works:
- ✅ 11 screenshots captured in `test-results/FULLPROOF-*.png`
- ✅ Direct page load works: `test-results/DIRECT-PAGE-LOAD.png`
- ✅ Shows full page with all debt data loaded
- ✅ No JavaScript errors (only minor 404 for missing favicon)

---

## 🔗 Quick Copy-Paste Links

**Just click or copy these:**

- http://localhost:8080/index.html (Home)
- http://localhost:8080/dashboard.html (Cash Flow Dashboard)
- http://localhost:8080/scenario-planner.html (Scenario Planner)
- http://localhost:8000/debt-strategy-complete.html (⭐ Debt Strategy ⭐)

---

## 🆘 Troubleshooting

### If the page shows "This site can't be reached"
1. Check servers are running in both terminals
2. Verify the port number (8080 for cash flow, 8000 for debt)
3. Make sure you're using `http://localhost:` not `file://`

### If you see "Unable to load dynamic data"
- You're probably using `file://` instead of `http://localhost:`
- Use the correct localhost link above

### If you see old cached data
- Hard refresh: **Cmd + Shift + R** (Mac) or **Ctrl + Shift + R** (Windows)
- Or clear browser cache
