# UI Components Map - AI Insights

## Overview
This document maps all functional UI cards and popups in the AI Insights module to their source files.

---

## 1. Main Dashboard Card
**Location:** `components/ai-insights/Dashboard.tsx`

### Components:
| Element | Lines | Description |
|---------|-------|-------------|
| Quick Check Card | ~200-400 | Domain input, run check button |
| Results Panel | ~1127-1350 | Visibility results popup |
| Competitor Cards Grid | ~400-600 | Grid of competitor cards |

### Results Panel Sections:
- **AI Visibility** (lines 1131-1151) - Score with (i) tooltip
- **AI Mentions** (lines 1153-1171) - X/Y format with (i) tooltip
- **Platform Results** (lines 1174-1217) - 4 platforms grid with (i) tooltip
- **Query Details** (lines 1219-1317) - Expandable query results with (i) tooltip

---

## 2. Competitor LLM Content
**Location:** `components/ai-insights/CompetitorLLMContent.tsx`

Used in: CompetitorDetailPopup (LLM tab)

### Sections:
| Element | Lines | Description |
|---------|-------|-------------|
| Visibility Score | ~176-217 | Score %, threat badge |
| AI Mentions | ~219-238 | X/Y responses count |
| Platform Results | ~242-312 | 2x2 grid with check/x icons |
| Query Results | ~314-429 | Expandable per-query details |
| Discovery Data | ~431-456 | Purple box with LLM index data |
| Actions | ~466-512 | Refresh, Counter Strike, Delete |

### Tooltips (i) icons:
- AI Visibility Score (line 199)
- AI Mentions (line 224)
- Platform Results (line 244)
- Query Results (line 317)

---

## 3. Competitor SEO Content
**Location:** `components/ai-insights/CompetitorSEOContent.tsx`

Used in: CompetitorDetailPopup (SEO tab)

### Sections:
- Domain Authority / Page Authority
- Backlinks count
- Keywords ranking
- Traffic estimates

---

## 4. Quick Check Card
**Location:** `components/ai-insights/QuickCheckCard.tsx`

### Sections:
| Element | Description |
|---------|-------------|
| Domain Input | Text field with validation |
| Run Check Button | Primary action |
| Loading States | Spinner, progress |
| Results Display | Score, mentions, platforms |

---

## 5. Add Competitor Dialog
**Location:** `components/ai-insights/AddCompetitorDialog.tsx`

### Features:
- Domain input
- Visibility check option
- Save as competitor

---

## 6. Competitor Detail Popup
**Location:** `components/ai-insights/CompetitorDetailPopup.tsx`

### Tabs:
1. **LLM** - Uses `CompetitorLLMContent.tsx`
2. **SEO** - Uses `CompetitorSEOContent.tsx`

---

## 7. Counter Strike Dialogs
**Location:** `components/ai-insights/Dashboard.tsx`

| Dialog | Lines | Purpose |
|--------|-------|---------|
| Refresh Confirm | ~1339-1380 | Confirm refresh visibility check |
| Counter Strike Confirm | ~1380-1420 | Confirm content gap analysis |
| Counter Strike Results | ~1420-1500 | Show generated topics |

---

## 8. Mission Prep Dialog
**Location:** `components/ai-insights/MissionPrepDialog.tsx`

Deep analysis preparation dialog with:
- Query selection
- Platform configuration
- Credits confirmation

---

## Tooltip Pattern

All cards use consistent (i) info icons with tooltips:

```tsx
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Usage:
<TooltipProvider>
  <div className="flex items-center gap-1">
    <span>Label</span>
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <p className="text-xs">Explanation text</p>
      </TooltipContent>
    </Tooltip>
  </div>
</TooltipProvider>
```

---

## File Tree

```
components/ai-insights/
├── Dashboard.tsx              # Main page, Results Panel
├── QuickCheckCard.tsx         # Domain check input
├── CompetitorLLMContent.tsx   # LLM visibility details
├── CompetitorSEOContent.tsx   # SEO metrics details
├── CompetitorDetailPopup.tsx  # Popup with tabs
├── AddCompetitorDialog.tsx    # Add new competitor
└── MissionPrepDialog.tsx      # Deep analysis prep
```

---

## Last Updated
2025-12-21
