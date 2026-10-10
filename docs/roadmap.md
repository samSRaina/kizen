### 1. Product Scope & Business Model

* **Value Proposition:** It is essentially a jira clone but for freelance developers that is currently designed to be self-hosted and opensource. Freelance devs manage the scrum list of their multiple clients. One feature that sets it apart from others is that it allows developers to track the time they spent on their projects and specific work/ticket which translates to how much money they have earned in the process. They can then manually bill their clients, there is no automatic billing generation. 
* **Monetization & Access:** free tier
* **Tenancy:** single-tenant/individual user accounts with isolation from multiple users on the same accounts.

---

### 2. Core Entities & Domain Workflows

* **Primary Domain Objects:** User, Ticket, Workspaces(projects) are the current key domain entities and stuff will be added as time goes.
* **Critical User Flow:** sign-in/sign-up -- sees dashboard with workspaces, open tickets, etc., -- workspaces/$workspace_id -- sees kanban board, total time sepent on tickets, total billables, etc. (core value is the billables and other normal functionalities of a scrum board)
* **State Machines / Lifecycle:** Tickets currently have approval flows (e.g., `Backlog -> In progress -> In Review -> Done`)?

---

### 3. Roles, Permissions & Authentication

* **Authentication Provider:** Have implemented better-auth within react+tanstack project for less complexity.
* **Authorization Model:** A user has access to everything within his session and no access to other users data(multiple user sessions on the same machine.)

---

### 4. Technical Stack & Architecture

* **Current/Target Stack:**
* Frontend React + vite + bun + tanstack
* Backend golang
* Database & Storage postgres for backend operations, and sqlite for frontend better-auth
* everythign is dockerized, the frontend and bakend.
* developement is carried out via tilt up command 


* **Communication Style:** currently using REST and will eventually implement GRPC for service to service comms.
* **Background Tasks:** currently not sure

---

### 5. Third-Party Integrations & External Services

* **Payments/Billing:** no
* **Messaging/Comms:** no
* **AI/LLM or Analytics:** eventually ai must be wired in as a worker hand in hand to work alongside. But that is for when the core functionality of the application is achieved.

---

### 6. Timeline, Milestones & Non-Functional Requirements

* **MVP vs. Full Scope:** wil build out iteratively, nothing planned as of yet
* **Compliance/Security Requirements:** Not currently but the constraints like HIPAA, GDPR, SOC2 compliance, data residency, or audit logging must be worked on only after the entire aplication core functionality is achieved.

---

Generate an implementation task list as backlog.
i am currently working on the dashboard frontend and will take the frontend and the backend hand in hand for my ease of developement, Ex: build backend api first, then frontend, then wire it in, and dockerize the service for runtime fine tuning.
