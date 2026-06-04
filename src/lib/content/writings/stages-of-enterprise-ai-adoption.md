---
title: Stages of Enterprise AI Adoption
date: May 13, 2026
order: 2
---

In the AI consulting practice at ABS Group, I get to watch companies around the world work through the journey of adopting AI. The journey is unique to every company. And yet, some things are remarkably similar.

Everyone has a lightbulb moment with AI that inspires them. Everyone reads the same articles about how [most enterprise adoptions fail](https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf). And everyone moves through a similar set of stages, trying to figure out how to land in that golden minority that gets significant return-on-investment from AI:

- **Stage 1** — AI as a trusted advisor, sitting in a browser tab
- **Stage 2** — AI that knows your company, grounded in your knowledge and standards
- **Stage 3** — AI that acts, integrated directly into the systems where work happens
- **Stage 4** — the unknown

Where companies differ is in how they move through the stages. **Technology-first** companies tend to aggressively progress through the stages, backtrack to work on their foundations, continue experimenting forward from the new baseline, and so on in a cycle. **Operationally-grounded** companies progress slowly, watching the whole thing play out with a healthy dose of skepticism and serious doubts that AI could actually affect what they're doing *in the real world*. **Security-conscious** companies are frozen in the early stages, afraid of making a mistake they can't take back.

Most companies are a mixture of all three.

## Stage 1 — AI as a trusted advisor

![Stage 1 illustration](stage_1.png)

Regardless of what archetype a company leans toward, Stage 1 is where it all starts. Someone opens a tab to ChatGPT or Claude or Gemini and starts asking it things. LLMs are shockingly "stupid" and "smart" at the same time, but the smart moments are frequent enough that going back to working without it feels like a step down.

This is the trusted-advisor stage. The AI doesn't know anything specific about the company, other than through files given to it within a chat, information on the web, and interactions it saves to user-specific memory over time. It doesn't have access to any of the systems where the work actually lives. It's just sitting in a browser tab, ready to read whatever gets pasted into it and respond.

Even so, it's still useful for a vast amount of knowledge work. Imagine 3 personas sitting in different areas of a company:

> **David** is a software engineer. He needs a quick script that calls an API with the value in each row of a CSV and writes the results into a new column. He hands the CSV and the API specification to Claude, which drafts a Python script. It doesn't run the first time, but Claude fixes it after being given the error. The script runs and the monotonous work is done.

> **Maya** is a proposal writer. She copies the executive summary into ChatGPT and asks for a critique. The feedback comes back paragraph by paragraph. She doesn't take every note — some of the suggestions flatten language she likes — but she works through the comments, tightens the argument in three places, and the summary is noticeably stronger by the time it goes to the partner for review.

> **Marcus** is a finance analyst. He pastes a dense paragraph from ASC 606 into Gemini and asks for a plain-language explanation. After some back and forth to make sense of it, he follows up with the specific contract structure he's trying to classify. The AI walks through the five-step revenue recognition model, applies it to his fact pattern, and flags the step where judgment is genuinely required.

### Enabling Stage 1

For an IT executive, making Stage 1 possible boils down to governance. The first decision is access. Pick one or two frontier providers and centralize on them. Centralization matters because of cost and visibility. When usage is scattered across personal accounts, you have no way to govern what data is going where. And whatever provider gets picked, the settings need to be configured deliberately. Training opt-out, retention windows, and region of processing are usually configurable — and the defaults aren't usually what an IT executive would choose.

The second decision is the acceptable-use policy. The policy needs to be specific. "Don't paste in confidential information" leaves people scratching their heads. What emails count as confidential — all of them? If the from/to, signatures, and client-specific information are removed, can the rest be pasted in? And most importantly, employees need a clear path to get help on the edge cases. If it's too slow or too difficult to get an answer, information will get pasted in anyway.

The third decision is training. People need to understand how the technology works at a high level, why it hallucinates, and where the data they paste in actually goes. This helps calibrate expectations, since employees who think the AI is magical will trust it too much, and employees who think it's a search engine will use it wrong. After that, people need to see examples of real people getting real work done with the tools. I've seen companies use rewards and recognition programs to try to incentivize AI use, but to employees, it tends to feel forced. If the best way to sell a product is for happy customers to talk to prospective customers, then the best way to get people to explore AI is the same. Find people who can demonstrate relevant use cases to others, then let the flywheel of early adopters talking to their coworkers do its thing.

## Stage 2 — AI that is contextual

![Stage 2 illustration](stage_2.png)

Once people are using AI regularly, they get tired of pasting in the same context every time. They start curating system prompts. They build folders of files they upload alongside their questions. Eventually a few of them share their setups with their teammates, and someone asks IT, "can we make this available to everyone?"

That's stage 2 starting. It usually emerges in pockets, wherever the early adopters sit. Engineering teams pull internal architecture docs into their AI tooling. Proposal teams build a repository of past wins. Finance teams compile their accounting memos. Each pocket builds something useful for itself. What pulls these efforts together into something durable is IT. Otherwise files go stale and the wrong people see the wrong documents.

This is the contextual stage. Now AI has access to the company's accumulated knowledge: the standards, the prior work, and the institutional memory. The same model that gave generic answers in Stage 1 now produces output that reflects how the company does things.

Back to our three personas:

> **David** is working on a refactor of the payment service. He asks Claude Code how to handle a retry pattern, and the response doesn't read like a generic best-practices article. It recommends the approach that aligns with the internal service architecture the team standardized on last year, flags that the obvious off-the-shelf library conflicts with a security policy put in place after a prior incident, and points him at an analogous implementation in another service that solved the same problem six months ago.

> **Maya** is drafting an approach section for a federal RFP. She asks ChatGPT to start a draft, and the output draws on the firm's three most recent public-sector wins. It includes the section structure that has worked, areas where her company might have an edge over others bidding for the project, and relevant past performance callouts.

> **Marcus** is drafting a policy memo for a contract structure that doesn't map cleanly to existing accounting treatment. He asks Gemini for help, and the response comes back in the controller's house format — numbered sections, plain-language rationale, effective date, preparer attribution. More usefully, it flags that a structurally similar contract was recorded differently in Q3 and surfaces the inconsistency for him to resolve. He hadn't remembered the Q3 contract. The AI did, because the company's accounting memos had been loaded into a knowledge base months earlier.

### Enabling Stage 2

For an IT executive, Stage 2 is an infrastructure problem. It involves building knowledge repositories, retrieval systems, and access controls.

The first decision is the repositories themselves — what goes in, and how to keep it current. The temptation is to throw everything in and let the AI sort it out. But out-of-the-box document extraction from LLM providers is generally bad. Scanned content often gets ignored and tables lose their structure. The two options are to 1) invest in better extraction tooling, or 2) fix the problem upstream by making sure new documents are written in parsable formats from the start. The second option is harder culturally but easier technically. And whichever approach you pick, ingestion has to be automated. A repository that depends on someone manually uploading new documents will rot.

The second decision is retrieval. As knowledge repositories grow, context engineering (getting the right subset of information into a model's context window) becomes essential. Out-of-the-box RAG works for simple cases, but not for the cross-document reasoning that delivers value at this stage. You'll likely need purpose-built retrieval agents that know how to query your repositories well, and you'll need to evaluate them. That way, as changes are made to the underlying knowledge and the retrieval system, you have observability into the accuracy of the system over time.

The third decision is authorization. Not everyone in the company should see everything in every repository. Proposals contain billing rates. HR documents contain personal investigation information. Board materials contain things that aren't yet public. When the retrieval system pulls a chunk of a document into the AI's context, the system has to know whether the person asking is allowed to see that chunk.

## Stage 3 — AI that acts

![Stage 3 illustration](stage_3.png)

While stages 1 and 2 are fun, they don't provide what we really want out of AI. It is still REACTIVE. You have to prompt it for it to do anything. And speaking of DOING things — it isn't. It is simply retrieving information, answering questions, and drafting content within the chat interface.

That changes in Stage 3. Here, the AI does things in systems where work actually lives (Jira, Salesforce, the ERP system, codebases, email), via direct tool calls or MCP. And most importantly, it does them **proactively**, via webhooks or heartbeats. It is interesting that it is also in this stage that companies often open up additional communication channels with the AI. Even though it isn't fundamentally that different from web chat, being able to message AI via platforms that employees already use with other humans (Slack, Teams, phone calls) is a big unlock for people. That's a big reason why OpenClaw blew up the way it did. All of the sudden the AI seems much more accessible, and always available to do work.

Back to our three personas:

> **David** wakes up to a Slack notification from the CI bot. A nightly build caught a regression in the payment service, and the AI has already posted a root cause summary to the incident channel — a dependency update that two downstream services hadn't accounted for it. The affected code paths are linked. A draft fix is sitting in an open PR with test coverage written against the failure case. He reads through the analysis, spots one edge case the PR missed, leaves a comment, and approves the revised version twenty minutes later.

> **Maya** opens her laptop and finds three RFPs already pre-screened in her inbox. The AI reviewed the morning's federal register postings, cross-referenced them against the firm's target market criteria, and flagged the three worth a look. Each one has a preliminary score against the firm's historical win criteria and a one-paragraph go/no-go recommendation. The highest-priority opportunity already has a shell proposal open: an executive summary scaffolded from prior wins in that agency, an approach section with placeholder language drawn from similar proposals, a team section populated with the most relevant bios. She reads through the recommendations and decides to pursue two of the three.

> **Marcus** is on day three of close. The AI has completed the first pass on twelve account reconciliations, flagged four variances above the materiality threshold, and drafted explanations for three of them based on supporting documentation it pulled from the ERP. The standard accruals that meet pre-approved criteria — entries within established ranges, matching prior-period patterns, tied to documented obligations — have already been posted to a staging ledger and are waiting for his sign-off. He reviews the flagged variances, investigates the one that doesn't have a clean explanation, and approves the staged entries after spot-checking a sample.

### How to enable Stage 3

For an IT executive, Stage 3 is the largest engineering investment.

The first decision is integration. The AI has to be able to read from and write to the systems where work happens, and those systems have to be ready to accept agent-driven traffic. Modern SaaS and PaaS products are scrambling to build agent-friendly APIs. The quality of the agent interfaces of these products should weigh heavily into procurement decisions. Also, companies usually have custom software solutions that they want to connect to, and those solutions may need to be refactored to be made ready for agents.

The second decision is what communication channels to open up to the AI. Integrating custom agents into messaging platforms like Teams and Slack isn't hard these days. But they also provide surfaces for prompt injection. For example: if an enterprise agent is monitoring an email inbox or a phone number, then that agent has a public interface. It is **very** difficult to fully protect against prompt injection. It is better to open up communication channels in places that can be protected with OAuth tokens and/or private networking.

The third decision is authorization, again. Stage 2 was about controlling what the AI could *see*. Stage 3 is about controlling what the AI can *do*, and on whose behalf. When David's AI opens a pull request, should it operate as a service account? Or should it operate as David, with David's permissions? The user's or agent's identity has to flow through the AI to the system being acted on, and that downstream system has to make the final call on whether the action is allowed. Ideally, the messaging platform and downstream system share the same identity provider, making this fairly straightforward. But even if it isn't, taking the time to get it right is essential.

## Stage 4 — the unknown

![Stage 4 illustration](stage_4.png)

Throughout history, transformative technologies haven't just accelerated existing workflows; they have fundamentally redefined the nature of work itself.

- In the 1440s, the printing press was initially perceived as a mechanized scribe — a faster way to copy manuscripts. However, the true impact was the democratization of knowledge. By making books cheap and reproducible, it stripped institutions of their monopoly on information, fueled the spread of literacy, and laid the groundwork for the Scientific Revolution.

- When electricity first entered the industrial sector, factory owners treated it as a direct substitute for steam. Steam power required a single, massive central shaft that dictated the layout of the entire factory. Electricity, however, allowed for decentralized power, meaning motors could be placed on individual machines. This let architects redesign factories and office layouts for efficiency from the ground up.

- In the 1990s, the "World Wide Web" was thought of as an optional digital brochure — a way to show your existing business to people who happened to have a modem. But the web eventually erased geography as a constraint. It didn't just change how products were sold; it rewrote competitive advantage by allowing global reach, remote labor, and entirely new business categories like SaaS and social media.

### The pattern in the present

Andrej Karpathy [tells a story](https://karpathy.bearblog.dev/sequoia-ascent-2026/) about an app he built called MenuGen. The premise is simple: you sit down at a restaurant, the menu has no pictures, and you don't know what half the dishes are. The app lets you upload a photo of the menu, OCRs the dish names, runs each through an image generator, and re-renders the menu with visuals next to each item. He built the whole thing — frontend, backend, Vercel deployment, authentication, payments. The full stack.

Then he watched someone do the same thing by handing the photo to Gemini with a one-line prompt: *overlay images of the dishes directly onto the menu image*. The model returned a single image: the original menu, with the dish photos rendered into the pixels. No OCR pipeline. No UI. No backend. No deployment. Just input and output.

His line: "All of MenuGen is spurious. It's working in the old paradigm. That app shouldn't exist."

A lot of what's being built right now is scaffolding around model limitations — temporary plumbing that exists only because the model couldn't do the whole thing yet. As models improve, entire product categories will collapse into a prompt. The question isn't "how do we build the old apps faster?" It's "which apps should stop existing?"

### How to enable Stage 4

Right now, almost everything being built with AI is some version of doing existing work faster. Speeding up existing work is the natural place to start. But over time, the winners won't be the companies that squeeze the most efficiency out of old workflows. They'll be the companies that find bigger, genuinely new problems to solve.

It is worth bringing people through stages 1-3 because that process changes how people think about their work. They will have ideas that wouldn't have occurred to them otherwise. I think that it is the people on the front lines — the ones using AI day in and day out, pushing it to its limits — that will be the most likely to unlock the next big thing.

We enable Stage 4 is by building the conditions for it in stages 1-3.
