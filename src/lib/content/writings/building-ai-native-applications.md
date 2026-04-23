---
title: Building AI-Native Applications
date: April 8, 2026
description: Practical advice for designing applications that work cleanly with agentic loops instead of fighting them.
section: engineering
order: 1
---

Software has historically been built on three primitives: list views, detail views, and forms. You navigate to a list, pick a record, fill out a form. Nearly every enterprise app (Jira, Salesforce, Workday) is this pattern stacked a hundred times. It works. It's boring. And it's increasingly in the way.

Now we've tasted a future where AI agents understand what we're trying to do and go do it, allowing us to focus on unemployment. What!? I mean -- CREATIVE and STRATEGIC work. This goal cannot be achieved by putting a chat bar in an application's existing UI. Oh, so it can write data into your application now instead of just answering questions about it? Good, but not good enough.

The challenge is designing applications from the ground up that are built for agentic loops (CLIs like Claude Code, OpenClaw, or Cursor, or UIs like ChatGPT and Gemeni) to use.

Nearly everyone is putting AI into their applications, but why is it that some implementations are genuinely useful, while others feel oddly hollow? Here is some practical advice for building an "AI-native" application: an application that plays nicely with any agentic loop the user has access to.

When writing services, the audience has changed. We are no longer building for human developers, we are building for AI agents.

Let's explore these differences in more detail, using a concrete example: Jira vs. Linear.

## Design for predictable state

When an agent creates an issue, it needs to know what fields are required, what values are valid, and how to reference that issue later. Every degree of freedom in your data model is a question the agent has to answer at runtime -- and every opaque identifier is a mapping it has to maintain across tool calls.

Jira's flexibility illustrates both problems at once. Because projects can have custom required fields, creating an issue requires 3-4 discovery calls before anything can be written:

```text
// 1. Discover available projects
GET /rest/api/3/project/search

// 2. Discover issue types and valid statuses
GET /rest/api/3/project/{projectId}/statuses

// 3. Discover valid priorities
GET /rest/api/3/priority

// 4. Discover required custom fields for this issue type
GET /rest/api/3/issue/createmeta/{projectId}/issuetypes/{issueTypeId}

// Only now can we construct a valid payload
POST /rest/api/3/issue
{
  "fields": {
    "project": { "id": "10001" },
    "issuetype": { "id": "10042" },
    "summary": "...",
    "customField_10042": "..."
  }
}
```

And the IDs returned from those discovery calls -- 10001, 10042, 31 -- are opaque numerics that mean nothing outside the context of the current session. If the agent needs to reference the same project or transition across tool calls, it has to maintain an ID mapping layer in its context window. That mapping is state the agent is forced to carry, and state that can go stale.

Linear's approach eliminates both problems. It has a fixed schema with no custom required fields, so one lookup resolves everything needed to write:

```graphql
// One prior lookup to resolve stateId, then:
mutation {
  issueCreate(input: {
    teamId: "{teamId}"
    title: "..."
    description: "..."
    priority: 2
    stateId: "{stateId}"
  }) {
    issue { id url }
  }
}
```

And the identifiers are human-readable and stable -- ENG-423 works directly in the API, survives across sessions, and is unambiguous without a lookup table.

The design principle here is that flexibility and predictability trade off directly. Custom fields, configurable workflows, and dynamic schemas are genuinely valuable for human teams with varying needs. But every degree of configurability is a discovery call an agent has to make and a mapping it has to maintain. When designing for agents, a fixed schema with sensible defaults costs almost nothing for typical use cases and saves the agent significant overhead on every operation.

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

The information is technically there -- but classifying the event requires the model to read into `changelog.items`, identify the relevant field, and infer what kind of change occurred. That's a reasoning step. And when an event contains multiple items in that array representing different changes simultaneously, it's an ambiguous reasoning step.

Linear answers the classification question before the payload needs to be read at all:

```json
{
  "type": "Issue",
  "action": "update",
  "updatedFrom": { "stateId": "..." },
  "data": { ... }
}
```

The model knows what it's handling from the first two fields. The rest of the payload is details.

This is a small cost per event, but it's a recurring one. Every event an agent handles starts with the same classification step, and unclear envelopes make that step harder every time. When designing events for agents, put the answer to what happened in the envelope -- not buried in the payload where the model has to find it.

## Consider GraphQL over REST

Jira is REST. Linear is GraphQL. For a human writing a one-off integration, this is a minor preference debate. For an agent making many calls in a session, it matters concretely.

With REST, once you have a root ID, fetching related context requires a separate call per entity. Jira's `expand` parameter helps at one level deep, but you can't arbitrarily traverse relationships:

```text
// Jira: three calls to hydrate context around a single issue
GET /rest/api/3/issue/ENG-423
→ response includes cycleId: null (Jira has no cycles), projectId: "10001", assigneeId: "abc"

GET /rest/api/3/project/10001
→ response includes project metadata

GET /rest/api/3/user?accountId=abc
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
			priority
		}
	}
}
```

One caveat worth stating directly: GraphQL doesn't eliminate bootstrapping round trips. If the agent doesn't know the issue ID yet -- because it needs to search first -- that's still a separate call. What GraphQL eliminates is the fan-out that happens once you have a root ID and need to hydrate related context around it. That's the pattern that dominates in an agent reasoning loop.

A typical loop step might look like:

```text
REST (Jira):
  1. Search for issues in sprint         → get issue IDs
  2. Fetch each issue                    → get projectId, assigneeId per issue
  3. Fetch each project                  → get project metadata
  4. Fetch each assignee                 → get team context
  Total: 1 + N + N + N calls (N = issues in sprint)

GraphQL (Linear):
  1. Query cycle with nested issues,
     assignees, projects, and states     → everything in one response
  Total: 2 calls (search + one hydration query)
```

With REST that's potentially dozens of sequential calls at scale, each one a latency hit and a rate limit token. GraphQL also lets the agent request exactly the fields it needs -- REST responses return a fixed shape with often dozens of fields the agent will never read, which means more tokens spent parsing noise in the LLM context window.

When designing APIs for agents, minimize round trips and response surface area.

## Raise the rate limits

Agents make more API calls than humans because they don't pause between actions. An agent iterating over issues, pulling related context, and writing back results can exhaust a rate limit in seconds that a human developer would take hours to approach. Both Jira and Linear have generous absolute limits -- this isn't a gotcha about low ceilings.

What matters for agents is how many independent limit surfaces you have to manage. Jira Cloud enforces three: an hourly points quota, a per-second burst limit, and a per-issue write limit. All three can fire independently, each returns a different `RateLimit-Reason`, and each requires a different backoff strategy. An agent doing exploratory reads might stay within the hourly quota but trip the burst ceiling. An agent writing status updates might hit the per-issue write limit while the hourly quota is nearly untouched.

```text
// Jira: three independent 429 surfaces, each requiring different handling
RateLimit-Reason: jira-quota-tenant-based   → pause all requests until hourly reset
RateLimit-Reason: jira-burst-based          → back off on this endpoint only
RateLimit-Reason: jira-per-issue-on-write   → delay writes to this issue, continue elsewhere
```

Linear enforces two limits via a single leaky bucket per user: 5,000 requests/hour and a complexity budget of 3,000,000 points/hour. One limit surface, constant refill rate, one backoff strategy.

```text
// Linear: two headers, one strategy
X-RateLimit-Requests-Remaining: 4950
X-RateLimit-Complexity-Remaining: 2994000
// If either hits zero: wait for refill, then resume. Same logic either way.
```

Both APIs do rate limiting well. The design lesson isn't "Jira bad" -- it's that each independent limit surface your API has is a new failure mode an agent loop has to handle correctly. When designing APIs for agents, consolidate your limit surfaces and make the backoff behavior uniform.

A complexity budget is a way of measuring API usage by the weight of what you're asking for, not just the count of requests.

In Linear's GraphQL API, every query is assigned a point score based on how much work the server has to do to fulfill it. A query that fetches a single issue title might cost 2 points. A query that fetches 50 issues, each with their assignee, cycle, project, and state, might cost 800 points. Your budget is 3,000,000 points/hour -- so you could make many simple queries or fewer expensive ones, and the system charges you proportionally either way.

The contrast with pure request counting: under a request-count-only model, `GET /issue/ENG-1` and `GET /issues?limit=500&expand=assignee,project,cycle` cost the same -- one request each. That's a bad signal. The second call is orders of magnitude more expensive for the server but looks identical to the rate limiter.

Complexity budgets fix this by making the rate limit reflect actual server load rather than HTTP call count. For agents specifically this matters because agents tend to make a small number of large, deeply nested queries rather than many small ones -- so a complexity budget is a more accurate model of their actual resource consumption than a raw request count.

The practical implication for the piece: Linear's complexity budget is why consolidating round trips (the GraphQL section's argument) doesn't get you "free" unlimited data. You save request count budget by batching, but you spend complexity budget proportionally to what you fetch. The two limits balance each other, which is actually good design.

## Authenticate simply, authorize deeply

Jira's OAuth 2.0 flow has an extra step that catches almost everyone: after exchanging the authorization code for a token, you can't make API calls yet. You must first resolve the `cloudId` -- a UUID identifying which Atlassian site the token is valid for -- by calling a separate endpoint, then embed it in every subsequent URL.

```text
// Step 1: exchange code for token
POST https://auth.atlassian.com/oauth/token

// Step 2: resolve cloudId — required before any API call
GET https://api.atlassian.com/oauth/token/accessible-resources
→ [{ "id": "1324a887-45db-1bf4-1e99-ef0ff456d421", "name": "My Site", ... }]

// Step 3: now construct every URL with the cloudId
GET https://api.atlassian.com/ex/jira/1324a887-45db-1bf4-1e99-ef0ff456d421/rest/api/3/issue/ENG-1
```

Linear's API endpoint is `https://api.linear.app/graphql`. Always. No tenant routing, no site resolution, no URL construction. One token, one endpoint.

```text
// Linear: token → call API. Done.
POST https://api.linear.app/graphql
Authorization: Bearer {token}
```

The more important difference for agents is scope granularity. An agent shouldn't have more access than it needs. Jira's OAuth scopes are coarse: `read:jira-work` and `write:jira-work` are the primary options -- there's no way to express "this agent can create issues but not close them."

Linear has purpose-built agent scopes:

- `issues:create` - Create issues, not update or delete
- `comments:create` - Comment only
- `app:assignable` - Can be assigned to issues
- `app:mentionable` - Can be @mentioned
- `initiative:read` - Read initiatives, no write

An agent that triages incoming issues needs `issues:create` and `comments:create`. Nothing else. That's expressible in Linear. In Jira, you'd grant `write:jira-work` and accept broader access than the agent actually requires. When designing APIs for agents, the ability to express least-privilege access is a security primitive, not a nice-to-have.

## Aside: More on agent authorization

When a human developer has access to multiple projects, we trust them not to cross-contaminate. A developer working on an internal tool doesn't paste customer data from a different project into a comment -- not because the API prevents it, but because they know which context they're operating in. That cognitive boundary is invisible to the API.

Agents don't have it. An agent with broad workspace access and an ambiguous prompt can pull context from Project A, reason over it, and surface it in Project B -- not through any malicious behavior, but because its context window has no inherent sense of project boundaries. The only reliable way to enforce those boundaries is at the token level: scope the agent's access to exactly the data it should be able to see for this invocation.

This means agent tokens need to be scoped at invocation time, not at setup time. A human logs in once and carries their broad access throughout a session. An agent should be instantiated with a token scoped to the specific project, team, or resource it was invoked to act on.

## Include intent endpoints

Most APIs are CRUD: create this resource, update that field, delete this record. That's the right model when the caller knows exactly what it wants to do. But in agentic systems, the caller is often working at a higher level -- it has a goal, not a specific operation in mind.

Consider what an agent has to do to close out a sprint in Jira: fetch the active sprint, find incomplete issues, assess which should roll over vs. be closed, transition each issue's status, update the sprint, and post a summary comment. That's a dozen API calls, each dependent on the last, with LLM reasoning threaded between them. The agent is improvising a workflow from primitives.

An intent endpoint collapses that into one call: `POST /sprints/{id}/close`. The logic lives on your server -- not in the agent's context window.

This matters for reasons beyond convenience:

- You control the model. When the logic is inside your endpoint, you choose which model handles it, with what system prompt, and with what constraints. An agent loop calling your intent endpoint doesn't get to substitute a cheaper model or a different prompt. You own the behavior.
- You can measure it. A CRUD sequence improvised by an agent is nearly impossible to evaluate consistently -- the path varies every run. An intent endpoint has a fixed interface and a fixed expected output. You can build a truth set against it, run evals, and tune the system prompt with confidence that improvements are real and durable.
- You can optimize it independently. The agent calling your endpoint doesn't need to know whether the implementation is a single structured LLM call, a small agent loop, or a deterministic workflow. You can swap the internals -- better model, tighter prompt, new retrieval step -- without changing the contract.

```text
// Instead of this — agent improvises from primitives, you have no control
agent: GET /sprint/active
agent: GET /sprint/{id}/issues
agent: [LLM: which issues should roll over?]
agent: POST /issue/{id}/transition  × N
agent: POST /sprint/{id}/complete
agent: POST /issue/{id}/comment

// Do this — intent endpoint, logic is yours
agent: POST /sprint/{id}/close
→ your server: runs the logic, uses the model you chose,
  logs against your truth set, returns structured result
```

The tradeoff is that intent endpoints require you to anticipate the actions agents will want to take. For stable, high-value workflows -- close sprint, triage inbox, generate release notes -- the investment pays off immediately. For one-off or unpredictable operations, raw CRUD is still the right primitive.

The pattern also composes well with authorization. An intent endpoint like `/sprint/{id}/close` can enforce its own access logic -- this agent can close sprints on Team A but not Team B -- in a way that's much harder to enforce when the same operation is assembled from a dozen separate CRUD calls, each individually authorized.

When designing APIs for agents, expose intent where you can afford to. Every intent endpoint you own is a system prompt you control, a metric you can measure, and a behavior you can improve.
