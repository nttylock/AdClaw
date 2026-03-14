# Mission Control — Web UI Enhancement TODO

> **Goal**: Per-persona communication, activity visibility, task planning on web.
> **Constraint**: Shared AOM memory across all persona sessions.

---

## P1: @mention persona selector in chat (~2-3h)

- [ ] **1.1** Fetch personas list from `/api/agents/personas`
- [ ] **1.2** Add persona chip bar via `sender.beforeUI` — clickable tags: `@coordinator`, `@researcher`, `@content-writer`
- [ ] **1.3** Active persona chip highlighted (selected state)
- [ ] **1.4** In `customFetch`: prepend `@{persona_id} ` to message text when persona selected
- [ ] **1.5** Click again to deselect (message goes to coordinator by default)
- [ ] **1.6** Show persona avatar/emoji on chips
- [ ] **1.7** Build + verify

## P2: Persona Status Board (~1d)

- [ ] **2.1** New page `/dashboard` or section on Personas page
- [ ] **2.2** Card per persona: name, role, avatar, status (active/idle)
- [ ] **2.3** Last message preview + timestamp (from session API)
- [ ] **2.4** Session message count
- [ ] **2.5** Assigned cron jobs list (from `/api/cron`)
- [ ] **2.6** Quick action: "Chat with" → opens Chat with that persona pre-selected
- [ ] **2.7** Build + verify

## P3: Per-persona chat tabs (~1d)

- [ ] **3.1** Tab bar above chat: one tab per persona
- [ ] **3.2** Each tab = separate `session_id` (`persona_id::console--default`)
- [ ] **3.3** Switch tab → switch session context in `customFetch`
- [ ] **3.4** Unread indicator on tabs (persona responded)
- [ ] **3.5** "All" tab = coordinator (default, shared conversation)
- [ ] **3.6** Build + verify

## P4: Cron → Persona view (~3-4h)

- [ ] **4.1** On Personas page: show scheduled cron jobs per persona card
- [ ] **4.2** Filter `/api/cron` by `dispatch.target.user_id` or session persona
- [ ] **4.3** Display: schedule + task text (e.g. "Daily 9:00 — Find AI trends")
- [ ] **4.4** Quick action: "Add task" → opens CronJob drawer with persona pre-filled
- [ ] **4.5** Build + verify

---

## Validation

- [ ] **V1** @mention works: select persona → message routed correctly
- [ ] **V2** Status board shows real data from running personas
- [ ] **V3** Chat tabs maintain separate conversations per persona
- [ ] **V4** Cron jobs visible on persona cards
- [ ] **V5** AOM memory shared across all persona tabs
- [ ] **V6** npm run build — no errors

---

*Priority: P1 → P2 → P3 → P4. Shared AOM memory is critical.*
