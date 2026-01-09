## **\[BRD\] Patient Feedback Center (Unified Insight & Issue Detection System)**

---

# ChatGPT convo: [https://chatgpt.com/share/e/69272c79-1434-8011-9364-7499ed25fb26](https://chatgpt.com/share/e/69272c79-1434-8011-9364-7499ed25fb26)

# **Narrative \- The Patient & The Employee**

**Patient Perspective — “This always happens…”**  
 Janice is a long-time Blink patient. Yesterday she tried to refill her prescription, but the app kept looping her back to the login screen. After three tries, she gave up. That evening, she received an NPS survey and responded angrily:

“The app doesn’t work. I can’t get my meds. Why is Blink always broken?”  
 She also left a 1-star App Store review saying she feels “abandoned” by the product.

From Janice’s point of view, Blink “should know” about this problem and fix it before she encounters it.

---

**Internal Perspective — “We’re discovering issues by accident…”**  
 Meanwhile, at Blink, an Ops agent named Carlos spent 45 minutes with a different patient troubleshooting the exact same login loop issue — a problem that had already happened to dozens of patients that week.

But the engineering team didn’t know. Product didn’t know. Ops had a sense something was wrong, but nothing connected the dots. It wasn’t until a co-founder tried to order a medication and saw the same issue that the organization realized:

“This is a Sev-2. We need to fix it *now*.”

The founders shouldn’t be the early warning system. Patients shouldn’t be the smoke detectors.  
 The Patient Feedback Center exists to **catch broken windows early**, consolidate all patient-reported issues, and transform frustration into actionable insight — so that problems are solved proactively, fast, and systematically.

---

# **1\. Problem Statement**

Blink lacks a **unified, proactive system** for collecting, consolidating, and triaging patient-reported issues from all feedback channels. As a result:

* Issues go undetected for too long

* Broken windows are often discovered by founders, VIPs, or chance

* Teams react instead of preventing escalations

* Patient pain compounds and becomes harder to solve

* Feedback is scattered across surveys, support, app reviews, chats, and emails

This initiative solves the systemic visibility gap.

---

# **2\. Objectives & Key Results (OKRs)**

### **Primary Objective**

Create a centralized Patient Feedback Center that transforms raw patient frustration into prioritized, actionable insights — and ensures issues are identified and addressed before they harm patient experience.

### **Key Results**

**KR2.1** — Centralize all feedback streams (Customer Care, App reviews, NPS, surveys) into a single system \[new tool\].  
 **KR2.2** — 100% of feedback triaged and tagged weekly with ownership assigned.  
 **KR2.3** — ≥80% of feedback items closed or actioned within a defined timeframe based on severity using our existing **Sev-1, Sev-2, …** framework.

### **Additional Goals**

* Identify issues/problems **before** founders or VIPs notice

* Ensure every high-friction patient experience has a clear owner

* Improve time-to-detection for emerging issues (weeks → hours/days)

* Improve patient trust, app store ratings, and NPS by preventing repeat failures

---

# **3\. Scope**

### **In Scope**

* Aggregating feedback from multiple channels

* Filtering for negative or issue-related signals

* Grouping feedback into issues (AI-assisted clustering w/ human-in-loop)

* Linking issues back to patient metadata (order, drug, platform, etc.)

* Issue lifecycle tracking (backlog → planned → in progress → shipped → verified)

* Weekly triage rituals

* Jira integration for fast ticket creation

* Ability to merge/split issues

* Dashboards for trends, high-severity alerts, top friction themes

* Integration with Data team’s ETL tables (Databricks)

### **Out of Scope (V1)**

* Bringing in all support calls/tickets (only flagged ones)

* Automated Jira workflows (V2)

* Advanced sentiment analysis (we use rating-based filters instead)

---

# **4\. Feedback Sources**

### **Included in V1**

* NPS detractors (score \<4)

* CSAT scores \<2

* App Store / Google Play reviews \<2 stars

* Trustpilot reviews \<3 stars

* “Did Not Purchase” negative feedback

* Agent-flagged calls

* Agent-flagged chats

* Email threads where a negative interaction occurred

### **Future Phases**

* Automated call transcription and issue extraction

* Manufacturer-related ticket feeds

* Pharmacy feedback integration

---

# **5\. Filtering & Intake Rules**

* Ingest **only negative or problem-indicating signals**

* For calls/chats/emails, agents explicitly **flag** problematic events for ingestion

* Surveys and reviews automatically filtered based on their rating thresholds

* The system captures:

  * Raw text

  * Rating

  * Source channel

  * Timestamp

  * Linked IDs (patient, order, drug, pharmacy, platform, etc.)

---

# **6\. Functional Requirements**

## **6.1 Data Consolidation**

The tool must consolidate all feedback sources into a **single feed**, with filters for:

* Source

* Severity

* Product surface (app, web, fulfillment, price, etc.)

* Drug/order

* Team ownership

Data will originate from existing **Data team Databricks tables and ETLs**; the tool will ingest from curated summary tables.

---

## **6.2 Grouping & De-duplication**

* AI-driven automatic grouping of similar feedback items

* Human-in-the-loop review for validation

* Ability to merge two issues

* Ability to split an issue into multiple child issues

* Issue page should show:

  * Summary

  * Severity

  * Owner

  * Affected patients

  * Number of occurrences

  * All raw feedback items (with drill-down)

---

## **6.3 Severity Framework (Existing Engineering Framework)**

Use the current engineering severity model:

* **Sev-1:** Patient cannot access care / system down

* **Sev-2:** Major product functionality blocked

* **Sev-3:** Noticeable friction affecting many patients

* **Sev-4:** Minor friction or isolated feedback

* **Sev-5:** Cosmetic or informative suggestion

Tool functionality:

* Auto-suggest severity based on volume \+ metadata

* Human reviewer can override

---

## **6.4 Issue Lifecycle**

Every issue moves through these states:

1. **Backlog**

2. **Triaged**

3. **Assigned**

4. **In Progress**

5. **Shipped**

6. **Verified Solved** (manual verification)

Issue closure is **manual**, not automated.

---

## **6.5 Jira Integration**

* One-click Jira ticket creation from an Issue

* Pre-filled metadata (description, steps, patient examples)

* Select target Jira board based on issue category

* Ability to update ticket linkage over time

* Future: automated Jira creation for Sev-1/Sev-2 bursts

---

## **6.6 Notifications & Alerts**

* Slack alert for:

  * New Sev-1 or Sev-2

  * 10 incidents in 24 hours

  * Any new issue emerging with steep trendline

* Weekly summary sent to Experience Review Committee

---

# **7\. Weekly Triage Workflow**

A small **Experience Review Committee**, including Product, Ops ICs, and the Patient Experience Single Threaded Leader, meets weekly to:

* Review all new issues

* Validate severity

* Assign ownership

* Decide whether to:

  * Add to backlog

  * Start an investigation spike

  * Open a Jira ticket

  * Mark “known / not fixing now”

* Ensure KR2.2 (100% triaged weekly) is met

* Confirm progress toward KR2.3 (\>80% closed/actioned)

---

# **8\. Reporting & Insights**

## **Required Dashboards**

* **Top 10 issues by volume** (weekly, monthly)

* **Issue trendlines** over time

* **Time-to-detection**

* **Time-to-first-action**

* **Count of affected patients per issue**

* **Issues by ownership team**

* **New vs. recurring issues**

* **Post-fix recurrence** analysis

## **Drill-Down Views**

Every issue page allows viewing:

* All patient feedback examples

* Their metadata

* Which orders were affected

* History of similar issues in the past

---

# **9\. Data Architecture**

* Source: Data Team’s Databricks datasets containing NPS, reviews, flagged tickets, etc.

* The Data team will provide:

  * Curated ETL tables for ingestion

  * Aggregated historical data (initial 3-month backfill)

* The internal tool will ingest via API or scheduled ETL jobs

* Future improvements may include:

  * Live ingestion streams

  * NLP enhancements for clustering

---

# **10\. Ownership**

### **System Ownership**

**Patient Experience Single Threaded Team**

### **Weekly Operations**

**Experience Review Committee**, including:

* Ops ICs

* Product lead

* Patient Experience Lead

* Engineering liaison (optional)

### **Issue Closure**

Owner team: usually **Product** or the **Single Threaded Leader**, depending on category.

---

# **11\. Vision**

**To transform patient frustration into actionable insight — and to detect, prioritize, and fix broken windows faster than they break.**

The long-term aspiration is a frictionless patient experience, where issues are spotted and resolved proactively, and where all patient-facing teams operate through a single, shared system of truth about what’s going wrong and what’s being fixed.

---

# **12\. Implementation Phases**

### **Phase 1 — Lightweight V1 (Foundational)**

* Integrate core data sources

* Build ingestion filters

* Create unified feed

* Implement issue grouping

* Add severity auto-suggest

* One-click Jira creation

* Create weekly triage workflow

### **Phase 2 — Enhancements**

* Slack alerts

* Merge/split issue functionality

* Deeper dashboards

* Historical backfill (3 months)

* Improve clustering algorithm

### **Phase 3 — Advanced Capabilities**

* Automated Jira creation for high-severity spikes

* Proactive anomaly detection

* Integrated call transcription ingestion

* Pharmacy and manufacturer feedback feeds

* Automated regression detection (post-release monitoring)

---

# **13\. Open Questions**

1. Should we allow surfacing “positive feedback” in a separate tab (for completeness)?

2. Do we want anonymized patient-level examples for external stakeholders (manufacturers)?

3. Should we analyze feedback by drug class or by condition?

4. Should we integrate predictive models to forecast issue risk?

