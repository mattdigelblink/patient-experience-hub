## **\[BRD\] Journey Observation Tool & Employee Journey Review Program**

---

# **🌟 Narrative Vignette — The Patient & The Employee**

**Patient Perspective — “I keep trying, but it’s not working…”**  
 Derrick is trying to refill his medication. He taps the link in the SMS, logs in, and tries to update his insurance card — but the screen loops and gives him a vague “Something went wrong” error. He waits, tries again, and then abandons the process entirely. Later he leaves a frustrated comment on an NPS survey:

“This flow is broken. I can’t get my meds. Why does Blink make this so hard?”

Derrick is just one patient. But unknown to the company, 40 other patients hit the same loop in the last 24 hours.

---

**Internal Perspective — “We’re flying blind.”**  
 Across the country, a Blink employee named Sarah is building a new feature meant to improve onboarding. She hasn’t seen a real patient’s journey in months. She doesn’t know that Derrick’s experience is currently broken. She has no way to “dogfood” the product herself — she can’t obtain a prescription for Blink-eligible medications, and the team lacks any way to view full, real, end-to-end patient journeys.

Meanwhile, the only time engineering hears about the error is when a founder attempts a refill weeks later and hits the same loop.  
 The founder posts in Slack:

“This is broken. How long has this been happening?”

Teams scramble. Fire drills begin.

The Journey Observation Tool exists so this *never happens again*.  
 It creates visibility, empathy, and proactive detection of issues — turning employees into observers of the actual patient journey and enabling monthly, company-wide journey reviews that surface problems before they become crises.

---

# **1\. Problem Statement**

Employees lack visibility into what patients experience end-to-end — and because employees cannot naturally “dogfood” the product (due to prescription constraints), there is no systematic way for them to test flows, catch issues, or understand the patient journey deeply.

This creates blind spots, delays in identifying broken windows, and reduces our ability to proactively identify friction before VIPs, founders, or patients escalate it.

---

# **2\. Objectives & Key Results**

### **Primary Objective**

Build a tool that lets employees observe any patient journey end-to-end — creating visibility, enabling empathy, and allowing proactive detection of product and operational issues.

### **Goals**

* Provide a single unified timeline of all touchpoints, events, communications, and interactions a patient experiences.

* Enable employees to review real patient journeys monthly, building empathy and insight.

* Surface friction points early and funnel them into the Patient Feedback Center for triage.

* Create a near-real-time “black box flight recorder” of each journey.

* Support both historical journeys and a **live view** of a patient currently going through the experience.

* Become the internal equivalent of dogfooding for a pharmacy product where employees cannot simply use the product themselves.

### **Key Result Alignment**

* Feeds new employee-created insights into the Patient Feedback Center (contributes to KR2.1 & KR2.2).

* Helps identify friction before VIPs notice (supports org-wide health).

* Drives increased issue detection and faster root-cause discovery.

---

# **3\. Scope**

### **In Scope**

* A unified timeline UI showing all patient touchpoints

* Integration with data lake sources (Databricks-based event tables)

* Integration with: Mixpanel, LevelAI (calls), SMS/email logs, chat transcripts

* Playback of voice broadcasts and call recordings

* Display of screen views and app/web events

* Employee ability to leave notes

* Tracking of employee monthly participation

* Live Journey Mode (observe a patient currently progressing)

* Feeding employee insights into the Patient Feedback Center

* Required monthly journey observation for a large group of employees

### **Out of Scope (V1)**

* AI-driven friction detection

* Automated suggestions or summaries

* Automated error classification

* Employee simulation of ordering or payment

* Direct editing or annotation of patient accounts

---

# **4\. Journey Data Sources (V1)**

All data sources included in V1:

* **SMS logs**

* **Email logs**

* **Voice broadcasts (with audio player)**

* **Chat transcripts**

* **Level AI call recordings & transcript**

* **Mixpanel events** (screen views, button clicks)

* **Screen recordings** (if Mixpanel supports them; otherwise static screen views)

* **Surveys** (NPS, DNPU, CSAT)

* **Order metadata** (drug, pharmacy, platform, insurance type, state, etc.)

* **System logs** (API errors, 400/500 responses flagged)

This mirrors the data sources referenced in the Dogfooding Plan.

P\&C\_ Dogfooding 2025-2026 Plan

---

# **5\. Functional Requirements (Journey Observer Tool)**

## **5.1 Unified Timeline View**

* Chronological vertical feed of **every event** in the patient journey

* No clicks required to view content (SMS, emails, chat messages visible in place)

* Each event block contains:

  * Event type \+ timestamp

  * Message body

  * Metadata

  * Indicators for errors or anomalies (API 400/500, failed delivery, etc.)

---

## **5.2 Detail & Playback**

* Voice broadcast event → “Play audio” \+ transcript

* Phone call → Level AI link, transcript, and playback

* Chat message → expandable to show full conversation history

* Screen view → screenshot or event representation

* Survey → show rating \+ verbatim feedback

---

## **5.3 Filters & Journey Categories**

Essential filters:

* Journey category (successful purchase & delivery, successful purchase & no delivery, created account but no purchase)

* Platform (iOS/Android/Web)

* Drug

* Pharmacy

* Insurance type

* State

* Timeframe

---

## **5.4 Metadata Linking**

Each journey must show:

* Order ID

* Patient ID

* Drug

* Fulfillment pharmacy

* Device type

* App version

* Insurance

* State

* All Mixpanel session identifiers

---

## **5.5 Live Observation Mode**

V1 includes:

* Employee assigned to a real patient actively progressing

* Live updates as events occur

* Ability to see errors in real time

* Ability to escalate internally if something is broken

This reflects the “Live Journey Observer Tool” described in your document.

P\&C\_ Dogfooding 2025-2026 Plan

---

## **5.6 Employee Note Taking**

* Free form text box with guidance placeholders:

   “What was confusing? What felt broken? Where did the patient experience friction?”

* One notes section per journey

* Notes feed **directly into the Patient Feedback Center** as a new feedback source

* Metadata includes employee ID, timestamp, and linked journey

---

# **6\. Employee Journey Review Program (Monthly Requirement)**

### **Program Overview**

Every employee must review at least **one patient journey per month**.

### **Assignment Rules**

* Default: random journey assignment

* Employee can choose an alternative journey or review multiple

* Assignment should represent realistic, recent, diverse experiences

* Exclude highly sensitive cases (e.g., unusual edge-case scenarios)

### **Tracking**

Track:

* Did the employee view the full journey?

* Did they listen to required audio elements?

* Did they complete required notes?

### **Compliance Reporting**

* Monthly report generated listing who did not complete their assigned journey

* Manual follow-up by managers (no automated enforcement for V1)

* Dashboard showing compliance trends across teams

---

# **7\. Integration With Patient Feedback Center**

Employee notes flow directly into the Patient Feedback Center as:

* Categorized feedback items

* With metadata linking back to the journey

* Labeled as “Employee Observation” source

This ensures:

* Organizational visibility

* Integration with issue grouping and Jira workflows

* Contribution to weekly triage (supports KR2.2 & KR2.3)

---

# **8\. Technical Architecture**

### **Data Sources**

* Databricks data lake event tables

* IntelRx unified patient journey tables (as referenced)  
   P\&C\_ Dogfooding 2025-2026 Plan

* Mixpanel for screen views

* LevelAI for phone calls

* SMS/Email providers (via existing ETLs)

### **Ingestion**

* Nightly ETLs \+ near-real-time event streaming for live observation

* Specialized table optimized for timeline rendering

* API layer to serve timeline data efficiently

---

# **9\. Users & Use Cases**

### **Users**

* **Everyone at Blink** (initially Product/Ops/Engineering/Data most relevant)

* Leadership

* Patient Experience team

* New hires during onboarding

* Pharmacy operations

### **Top Use Cases**

1. **Dogfooding Alternative** (primary)

2. Rapid investigation when a complaint arises

3. Pre-launch QA for product releases

4. New hire onboarding

5. Manufacturer meeting preparation

6. Org-wide empathy building

---

# **10\. Non-Goals (Important to State)**

* Not a QA automation tool

* Not an AI-driven issue detector

* Not a tool for editing patient data

* Not a replacement for engineering logs/debugging tools

* Not intended to simulate ordering or payment flows

---

# **11\. Vision Statement**

**Make journey observation a core operational practice for the entire company — bringing every employee closer to the true patient experience so we can spot issues early, build better products, and deliver a smoother, more empathetic patient journey.**

This is about **exposure, insight, and accountability**, ensuring we improve the product responsibly and proactively.

---

# **12\. Implementation Phases**

### **Phase 1 — Journey Observer V1**

* Unified timeline

* All communication channels

* Mixpanel events

* Level AI calls

* Employee notes → Feedback Center

* Monthly compliance reporting

### **Phase 2 — Live Journey Mode**

* Real-time observation

* Error flagging

* Immediate escalation for broken flows

### **Phase 3 — Advanced Instrumentation**

* Timeline performance optimizations

* Summary dashboards (per-drug, per-pharmacy friction)

* Deeper integration with Feedback Center workflow

* Additional data sources (images, attachments)

---

# **13\. Open Questions**

1. Should employees be required to watch the entire live journey in real-time?

2. How should journeys be sampled to avoid bias (e.g., not only complex cases)?

3. Should notes be visible company-wide or team-gated?

4. Do we want anonymization features for sensitive journeys?

