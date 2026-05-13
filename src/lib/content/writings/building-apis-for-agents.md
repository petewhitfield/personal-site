---
title: Building APIs for Agents
date: April 8, 2026
order: 1
---

APIs built in the last twenty years were designed for human developers writing integration code. I believe the APIs that will win the next decade will be the ones designed for a new caller: the agent loop. Agents are taking over what UIs used to do (finding records, creating them, stringing workflows together). When agents interface with applications, the API is the product. This shift changes the parameters when designing an API.

I'll use Jira and Linear as a running comparison, not to reopen the debate on which is the better project management tool, but because they provide a useful experiment. Two mature APIs, built by strong engineering teams, covering the same domain, designed a decade apart.

## Design for predictable state

When an agent creates an issue, it needs to know what fields are required, what values are valid, and how to reference that issue later. Every degree of freedom in your data model is a question the agent has to answer at runtime, and every opaque identifier is a mapping it has to maintain across tool calls.

Jira's flexibility illustrates both problems at once. Because projects can have custom required fields, creating an issue requires a chain of discovery calls before anything can be written:

```text
// 1. Discover available projects
GET /rest/api/3/project/search

// 2. Discover issue types and statuses for a project
GET /rest/api/3/project/{projectId}/statuses

// 3. Discover valid priorities for a project
GET /rest/api/3/priority/search?projectId={projectId}

// 4. Discover required custom fields for this issue type
GET /rest/api/3/issue/createmeta/{projectId}/issuetypes/{issueTypeId}

// Only now can we construct a valid payload
POST /rest/api/3/issue
{
  "fields": {
    "project": { "id": "10001" },
    "issuetype": { "id": "10042" },
    "summary": "...",
    "priority": { "id": "31" },
    "customfield_10042": "..."
  }
}
```

The IDs returned from those discovery calls (10001, 10042, 31) are opaque numerics that mean nothing outside the context of the current session. If the agent needs to reference the same project or transition across tool calls, it has to maintain an ID mapping layer in its context window. That mapping is state the agent is forced to carry, and state that can go stale.

Linear’s approach removes most of the discovery overhead. In the common case, one lookup to resolve teamId is enough before calling issueCreate, because the schema is fixed and status can default automatically if stateId is omitted. If the agent wants a specific workflow status, it needs one additional workflowStates lookup for that team; otherwise there are no Jira-style custom required field lookups before writing.

```graphql
# 1. Lookup the teamId
query {
	teams {
		nodes {
			id
			key
			name
		}
	}
}

# 2. Create the issue
mutation {
	issueCreate(input: { teamId: "{teamId}", title: "...", description: "...", priority: 2 }) {
		issue {
			id
			identifier
			url
		}
	}
}
```

The IDs used by Linear (such as ENG-423) encode both the team context (ENG) and the issue number, so an agent doesn't need to maintain state mapping like "10001 = Engineering project, 10042 = Bug issue type."

Flexibility and predictability trade off directly. Custom fields, configurable workflows, and dynamic schemas are valuable for human teams with varying needs. But every degree of configurability is a discovery call an agent has to make and a mapping it has to maintain.

When designing APIs for agents, a fixed schema with sensible defaults saves the agent significant overhead.

## Design for unambiguous events

When an agent receives a webhook, it reads the entire payload as text in its context window and reasons over it. There's no parse logic, no branching code -- just the model deciding what happened and what to do next. That means the cost of a poorly structured event isn't code complexity, it's reasoning load.

Jira collapses all issue mutations into a single `jira:issue_updated` event. A priority change, an assignee swap, and a status transition are indistinguishable at the envelope level:

```json
{
	"webhookEvent": "jira:issue_updated",
	"issue_event_type_name": "issue_generic",
	"changelog": {
		"items": [{ "field": "status", "fromString": "To Do", "toString": "In Progress" }]
	}
}
```

The information is technically there, and this form is easier for human developers to parse into a single type. But classifying the event requires a model to read into `changelog.items`, identify the relevant field, and infer what kind of change occurred. That's a reasoning step. And when an event contains multiple items in that array representing different changes simultaneously, it's an ambiguous reasoning step.

Linear answers the classification question before the payload needs to be read at all:

```json
{
  "type": "Issue",
  "action": "update",
  "updatedFrom": { "stateId": "..." },
  "data": { ... }
}
```

The model knows what it's handling from the first two fields. The rest of the payload is details. Every event an agent handles starts with the same classification step, and unclear envelopes make that step harder every time.

When designing events for agents, put the answer to what happened in the envelope, not buried in the payload.

## Consider GraphQL over REST

Jira is REST. Linear is GraphQL. When human developers are writing integrations, the distinction largely boils down to preference. For an agent making many calls in a session, it matters concretely.

With REST, once you have a root ID, fetching related context requires a separate call per entity. Jira's `expand` parameter helps at one level deep, but you still can't arbitrarily traverse relationships:

```text
// Jira: three calls to hydrate context around a single issue
GET /rest/api/3/issue/PROJ-456
→ response includes projectId: "10001", assignee: { accountId: "5f3becff3ab35c003f30d837" }

GET /rest/api/3/project/10001
→ response includes project metadata

GET /rest/api/3/user?accountId=5f3becff3ab35c003f30d837
→ response includes assignee metadata
```

With GraphQL, the ID exchange happens server-side. Once you have a root ID, you traverse as deep as you need in one query:

```graphql
# Linear: one query, the server resolves all joins
query {
	issue(id: "ENG-423") {
		title
		state {
			name
		}
		cycle {
			number
			startsAt
			endsAt
		}
		assignee {
			name
			team {
				name
			}
		}
		project {
			name
		}
	}
}
```

One caveat: GraphQL doesn't eliminate bootstrapping round trips. If the agent doesn't know the issue ID yet because it needs to search first, that's still a separate call. What GraphQL eliminates is the fan-out that happens once you have a root ID and need to hydrate related context around it.

A typical loop step might look like:

```text
REST (Jira):
  1. Search for issues in sprint         → get issue IDs
  2. Fetch each issue                    → get projectId, assignee accountId per issue
  3. Fetch each project                  → get project metadata
  4. Fetch each assignee                 → get team context
  Total: 1 + N + N + N calls (N = issues in sprint)

GraphQL (Linear):
  1. Query cycle with nested issues,
     assignees, projects, and states     → everything in one response
  Total: 1 call (or 2 if you need to search for the cycle first)
```

With REST that's potentially dozens of sequential calls at scale, each one a latency hit and a rate limit token. GraphQL also lets the agent request exactly the fields it needs. REST responses return a fixed shape with fields the agent will never read, which means more tokens spent parsing noise in the LLM context window.

When designing APIs for agents, minimize round trips and response surface area.

## Consider rate limits

Agents make more API calls than humans because they don't pause between actions. Both Jira and Linear have generous limits, but their approaches differ.

Jira enforces three independent rate limit types, each requiring different handling:

```text
RateLimit-Reason: jira-quota-tenant-based   → pause all requests until hourly reset
RateLimit-Reason: jira-burst-based          → back off on this endpoint only
RateLimit-Reason: jira-per-issue-on-write   → delay writes to this issue, continue elsewhere
```

Linear tracks two limits via a single strategy:

```text
X-RateLimit-Requests-Remaining: 4950        → requests until hourly reset
X-RateLimit-Complexity-Remaining: 2994000   → complexity points remaining per hour
```

The most interesting difference is Linear's complexity budget. Request count is a poor proxy for server load, particularly when the API is GraphQL. `GET /issue/ENG-1` and a query pulling fifty issues with assignees, cycles, and projects both count as one request, but the second is vastly more expensive to serve.

This mismatch matters more for agents than humans because agents favor fewer, deeper queries over many shallow ones. A developer writing UI code makes requests that fit a list view or detail page. An agent reasons over responses, so it naturally requests more context per call.

When designing APIs for agents, meter by work done, not just requests made.

## Authenticate simply

Jira's OAuth 2.0 flow has an extra step that catches almost everyone: after exchanging the authorization code for a token, you can't make API calls yet. You must first resolve the cloudId, a UUID identifying which Atlassian site the token is valid for, by calling a separate endpoint, then embed it in every subsequent URL.

```text
// Step 1: exchange code for token
POST https://auth.atlassian.com/oauth/token

// Step 2: resolve cloudId (required before any API call)
GET https://api.atlassian.com/oauth/token/accessible-resources
→ [{ "id": "1324a887-45db-1bf4-1e99-ef0ff456d421", "name": "My Site", ... }]

// Step 3: now construct every URL with the cloudId
GET https://api.atlassian.com/ex/jira/1324a887-45db-1bf4-1e99-ef0ff456d421/rest/api/3/issue/ENG-1
```

Linear's API endpoint is `https://api.linear.app/graphql`. Always. No tenant routing, no site resolution, no URL construction. Each token is workspace-scoped.

```text
// Linear: token → call API. Done.
POST https://api.linear.app/graphql
Authorization: Bearer {token}
```

This is a small thing per call, but it compounds. Every agent integrating with Jira has to implement the cloudId resolution step, cache the result somewhere, and rebuild URLs for every request. Every bug in that machinery is an auth bug, which means it's painful to debug and easy to get subtly wrong. Linear's model has none of that surface area because there's nothing to resolve.

When designing APIs for agents, keep the path from token to first successful call as short as possible.

## Authorize deeply

Both Jira and Linear offer granular OAuth scopes such as `issues:create` and `comments:create`. But scopes alone aren't enough.

An agent shouldn't have more access than it needs. This is true for humans too, but the stakes are different. A human with access to two projects knows which project they're working in and won't paste data from one into another. Not because the API stops them, but because they hold the context mentally. That cognitive boundary is invisible to the API, and agents don't have it. An agent with workspace-wide access and an ambiguous prompt can pull context from Project A, reason over it, and surface it in Project B without any malicious intent.

The only reliable way to enforce those boundaries is at the token level: scope the agent's access to exactly the data it should be able to see for this invocation. Not to everything the installing user can see. Not even to everything the OAuth scope allows. To the specific project, team, or resource the agent was invoked to act on.

Concretely, this means the platform hosting the agent, not the agent itself, mints a short-lived token at invocation time:

```text
POST /oauth/token/scoped
Authorization: Bearer {platform_token}
{
  "base_token": "{user_oauth_token}",
  "constraints": {
    "project_id": "ENG",
    "permissions": ["issues:read", "issues:create", "comments:create"]
  },
  "ttl_seconds": 300
}
→ { "scoped_token": "skt_...", "expires_at": "..." }
```

The scoped token inherits the user's identity but can only see and write to the `ENG` project, and it expires in five minutes. The agent never touches the base token. If the agent hallucinates a reference to a different project, the API rejects it. If the token leaks, the blast radius is one project for five minutes.

This pattern requires two things from the API: an endpoint that mints constrained tokens from a parent token, and resource-level enforcement that respects those constraints on every call. Neither is exotic. Cloud providers have done this for years with STS session tokens and IAM policy scoping, but most SaaS APIs haven't built the equivalent yet.

When designing APIs for agents, support per-invocation token scoping to cover the gaps regular OAuth scopes can't.

## Include intent endpoints

Most APIs are CRUD: create this resource, update that field, delete this record. That's the right model when the caller knows exactly what it wants to do. But in agentic systems, the caller is often working at a higher level: it has a goal, not a specific operation in mind.

Consider what an agent has to do to close out a sprint in Jira: fetch the active sprint, find incomplete issues, assess which should roll over vs. be closed, transition each issue's status, update the sprint, and post a summary comment. That's a dozen API calls, each dependent on the last, with LLM reasoning threaded between them. The agent is improvising a workflow from primitives.

An intent endpoint collapses that into one call: `POST /sprints/{id}/close`. The logic lives on your server, not in the agent's context window.

This matters for a couple reasons:

1. You control the details. When the logic is inside your endpoint, you choose which model handles it, with what system prompt, and with what constraints. An agent loop calling your intent endpoint doesn't get to substitute a cheaper model or a different prompt. You own the behavior.

2. You can measure it. A sequence improvised by an agent is very difficult to evaluate because the path varies every run. An intent endpoint has a fixed interface and a fixed expected output. You can build a truth set for it, run evaluations, and change parameters with confidence.

When designing APIs for agents, expose intent endpoints for repetitive, high ROI workflows.

## How agents call the API

How does the agent know your API exists in the first place, and how does it learn what endpoints to call? Today the answer is usually one of three things. The agent's harness has a skill or tool definition pointing at your API. The agent is invoking your CLI, which wraps the API. Or the agent is connecting through a protocol like MCP.

All three eventually bottom out in an HTTP request to your server. The protocol layer decides how the agent finds you; your API design decides whether the call goes well once it arrives. An MCP server in front of a badly-shaped API still has to make the three discovery calls before creating an issue; it just hides them from the agent by doing them itself, which trades agent-side reasoning cost for server-side latency and a more complex wrapper to maintain. Conversely, an API designed along the lines above is trivial to wrap, because there's little to paper over.

## The UI is optional

The familiar primitives of list views, detail views, forms, and navigation are no longer the only way people interact with software. The UI still matters, for now, but I expect that to change. What will remain is the system of record, business logic, and permissions. And what will matter is whether any agent a user chooses can easily drive the API, regardless of if that's an enterprise chatbot, a personal assistant, or something embedded in wearables.
