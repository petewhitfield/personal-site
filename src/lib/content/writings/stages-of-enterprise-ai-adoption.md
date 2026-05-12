---
title: Stages of Enterprise AI Adoption
date: May 5, 2026
order: 2
---

In the AI consulting practice at ABS Group, I'm getting the chance to watch companies all over the world work through the journey of adopting AI. The journey is unique to every company. There is no one-size-fits-all approach.

And yet, some things are remarkably similar... Everyone has a lightbulb moment with AI that inspires them. Everyone reads the same articles about how [most enterprise adoptions fail](https://mlq.ai/media/quarterly_decks/v0.1_State_of_AI_in_Business_2025_Report.pdf). And everyone moves through a similar set of stages, trying to figure out how to land in that golden minority that gets significant return-on-investment from AI:

- **Stage 1** — AI as a trusted advisor, sitting in a browser tab
- **Stage 2** — AI that knows your company, grounded in your knowledge and standards
- **Stage 3** — AI that acts, integrated directly into the systems where work happens
- **Stage 4** — the unknown; we'll talk about this later

Where companies differ is in how they move through the stages. **Technology-first** companies tend to aggressively progress through the stages, backtrack to work on their foundations, continue experimenting forward from the new baseline, and so on in a cycle. **Operationally-grounded** companies progress methodically, watching the whole thing play out with a healthy dose of skepticism and serious doubts that AI could actually affect what they're doing _in the real world_. **Security-conscious** companies are frozen in the early stages, afraid of making a mistake they can't take back.

Most companies seem to be a mixture of all three.

## Stage 1 — AI as a trusted advisor

![Stage 1 illustration](stage_1.png)

Regardless of what archetype a company leans toward, stage 1 is where it all starts. Someone opens a tab to ChatGPT or Claude or Gemini and starts asking it things. LLMs are shockingly "stupid" and "smart" at the same time, but the smart moments are frequent enough that going back to working without it feels like a step down.

This is the trusted-advisor stage. The AI doesn't know anything specific about the company, other than through files given to it within a chat, information on the web, and interactions it saves to user-specific memory over time. It doesn't have access to any of the systems where the work actually lives. It's just sitting in a browser tab, ready to read whatever gets pasted into it and respond.

Even so, it's still useful for a vast amount of knowledge work. Imagine 3 personnas sitting in different areas of a company:

> **David** is a software engineer. He needs a quick script that calls an API with the value in each row of a CSV and writes the results into a new column. He hands the CSV and the API specification to Claude, which drafts a Python script. It doesn't run the first time, but Claude fixes it after being given the error. The script runs and the monotonous work is done.

> **Maya** is a proposal writer. She copies the executive summary into ChatGPT and asks for a critique. The feedback comes back paragraph by paragraph. She doesn't take every note — some of the suggestions flatten language she likes — but she works through the comments, tightens the argument in three places, and the summary is noticeably stronger by the time it goes to the partner for review.

> **Marcus** is a finance analyst. He pastes a dense paragraph from ASC 606 into Gemini and asks for a plain-language explanation. After some back and forth to make sense of it, he follows up with the specific contract structure he's trying to classify. The AI walks through the five-step revenue recognition model, applies it to his fact pattern, and flags the step where judgment is genuinely required.

### Enabling Stage 1

For an IT executive, making Stage 1 possible boils down to governance. The first decision is access. Pick one or two frontier providers and centralize on them. Centralization matters because of cost and visibility — when usage is scattered across personal accounts, you have no way to govern what data is going where. And whatever provider gets picked, the settings need to be configured deliberately. Training opt-out, retention windows, region of processing are usually configurable, and the defaults aren't usually what an IT executive would choose.

The second decision is the acceptable-use policy. The policy needs to be specific. "Don't paste in confidential information" leaves a lot of employees scratching their heads. What emails count as confidential — all of them? If the from/to, signatures, and client-specific information are removed, can the rest be pasted in? And most importantly, employees need a clear path to get help on the edge cases. If it's too slow or too difficult to get an answer, information will get pasted in anyway.

The third decision is training. People need to understand how the technology works at a high level, why it hallucinates, and where the data they paste in actually goes. This helps calibrate expectations, since employees who think the AI is magical will trust it too much, and employees who think it's a search engine will use it wrong. After that, people need to see examples of real people getting real work done with the tools. I've seen companies use rewards and recognition programs to try to incentivize AI use, but it tends to feel forced to employees. If it is true that the best way to sell a product is for happy customers to talk to prospective customers, then the best way to get people to explore AI is the same. Find people who can demonstrate relevant use cases to others, then let the flywheel of early adopters talking to their coworkers do its thing.

## Stage 2 — AI that is contextual

![Stage 2 illustration](stage_2.png)

Once people are using AI regularly, they get tired of pasting in the same context every time. They start curating system prompts. They build folders of files they upload alongside their questions. Eventually a few of them share their setups with their teammates, and someone asks IT, _can we make this available to everyone?_

That's stage 2 starting. It usually emerges in pockets, wherever the early adopters sit. Engineering teams pull internal architecture docs into their AI tooling. Proposal teams build a repository of past wins. Finance teams compile their accounting memos. Each pocket builds something useful for itself. What pulls these efforts together into something durable is IT. Otherwise files go stale and the wrong people see the wrong documents.

This is the contextual stage. The AI still doesn't have access to the systems where work happens — those come in stage 3. But it now has access to the company's accumulated knowledge: the standards, the prior work, the institutional memory. The same model that gave generic answers in stage 1 now produces output that reflects how your company does things.

Back to our three personas:

> **David** is working on a refactor of the payment service. He asks Claude Code how to handle a retry pattern, and the response doesn't read like a generic best-practices article. It recommends the approach that aligns with the internal service architecture the team standardized on last year, flags that the obvious off-the-shelf library conflicts with a security policy put in place after a prior incident, and points him at an analogous implementation in another service that solved the same problem six months ago.

> **Maya** is drafting an approach section for a federal RFP. She asks ChatGPT to start a draft, and the output draws on the firm's three most recent public-sector wins. It includes the section structure that has worked, areas where her company might have an edge over others bidding for the project, and relevant past perfomance callouts.

> **Marcus** is drafting a policy memo for a contract structure that doesn't map cleanly to existing accounting treatment. He asks Gemini for help, and the response comes back in the controller's house format — numbered sections, plain-language rationale, effective date, preparer attribution. More usefully, it flags that a structurally similar contract was recorded differently in Q3 and surfaces the inconsistency for him to resolve. He hadn't remembered the Q3 contract. The AI did, because the company's accounting memos had been loaded into a knowledge base months earlier.

### Enabling Stage 2

For an IT executive, Stage 2 is an infrastructure problem. The visible part is just that the AI is suddenly more useful. Underneath, you're building knowledge repositories, retrieval systems, and access controls.

The first decision is the repositories themselves — what goes in, and how to keep it current. The temptation is to throw everything in and let the AI sort it out. But out-of-the-box document extraction from LLM providers is generally bad. Scanned content often gets ignored and tables lose their structure. The two options are to 1) invest in better extraction tooling, or 2) fix the problem upstream by making sure new documents are written in parsable formats from the start. The second option is harder culturally but easier technically. And whichever approach you pick, ingestion has to be automated. A repository that depends on someone manually uploading new documents will rot.

The second decision is retrieval. As knowledge repositories grow, context engineering — getting the right subset of information into a model's context window, becomes essential. Out-of-the-box RAG works for simple cases, but not for the cross-document reasoning that actually delivers value at this stage. You'll want purpose-built retrieval agents that know how to query your repositories well — and you'll want to evaluate them. That way, as changes are made to the underlying knoweldge and to the retrieval system, you have observibility into the accuracy of the system over time.

The third decision is authorization. Not everyone in the company should see everything in every repository. Proposals contain billing rates. HR documents contain personal investigation information. Board materials contain things that aren't yet public. When the retrieval system pulls a chunk of a document into the AI's context, the system has to know whether the person asking is allowed to see that chunk.

## Stage 3 — AI that acts

![Stage 3 illustration](stage_3.png)

In stages 1 and 2, AI is reactive. In stage 1, you ask it something, and it responds out of world knowledge. In stage 2, you ask it something, and it responds out of world + company knowledge. But it didn't _do_ anything. How boring!

That changes in stage 3. It opens a ticket, starts a draft, posts an update. It does these things in the systems where work actually lives — Jira, Salesforce, the ERP, the codebase, the inbox. And it does them while you're away from the desk, so that by the time you sit down at your desk, the work is partially or fully assembled and waiting for you.

As of

The implications take a while to land. The first time it happens, it feels like a productivity boost — the same job, but faster. The second or third time, it starts to feel different. You're no longer the one doing the work. You're the one _reviewing_ it, deciding what to keep, deciding what to fix, deciding what to throw out. Your hands are off the keyboard for the parts that used to take all day, and on it for the parts that used to be five minutes of judgment at the end. The proportion has flipped.

Back to our three personas:

> **David** wakes up to a Slack notification from the CI bot. A nightly build caught a regression in the payment service, and the AI has already posted a root cause summary to the incident channel — a dependency update changed a serialization format, and two downstream services hadn't accounted for it. The affected code paths are linked. A draft fix is sitting in an open PR with test coverage written against the failure case. He reads through the analysis, spots one edge case the PR missed, leaves a comment, and approves the revised version twenty minutes later. The investigation and first-draft repair that would have pulled two engineers through a morning are done before the on-call rotation has finished their coffee.

> **Maya** opens her laptop and finds three RFPs already pre-screened in her inbox. The AI reviewed the morning's federal register postings, cross-referenced them against the firm's target market criteria, and flagged the three worth a look. Each one has a preliminary score against the firm's historical win criteria — contract ceiling, required experience, evaluation weighting — and a one-paragraph go/no-go recommendation. The highest-priority opportunity already has a shell proposal open: an executive summary scaffolded from prior wins in that agency, an approach section with placeholder language drawn from analogous scopes, a team section populated with the most relevant project histories. She reads through the recommendations, adjusts the scoring on one criterion she weights differently, and decides to pursue two of the three.

> **Marcus** is on day three of close. The AI has completed the first pass on twelve account reconciliations, flagged four variances above the materiality threshold, and drafted explanations for three of them based on supporting documentation it pulled from the ERP. The standard accruals that meet pre-approved criteria — entries within established ranges, matching prior-period patterns, tied to documented obligations — have already been posted to a staging ledger and are waiting for his sign-off. He reviews the flagged variances, investigates the one that doesn't have a clean explanation, and approves the staged entries after spot-checking a sample. Close finishes a day earlier than it did last quarter.

The job moves up a level. None of these jobs shrink. They shift toward judgment, exception-handling, and oversight — which turns out to require _better_ judgment, not less of it. David spends more time on the edge case the AI missed than on the regression itself. Maya spends more time on the scoring criterion she weights differently than on the three pre-screens. Marcus spends more time on the one variance without a clean explanation than on the eleven that had one. The work that's left is the work that requires actual humans, and there's just as much of it as there ever was.

### How to enable Stage 3

For an IT executive, Stage 3 is where the engineering investment stops being optional. Stages 1 and 2 were policy and infrastructure. Stage 3 is software.

The first decision is integration. The AI has to be able to read from and write to the systems where work happens — and those systems have to be ready to accept agent-driven traffic. Some are: modern SaaS products are increasingly designed with agent-friendly APIs, and the platforms that win this stage are the ones that treat the agent as a first-class caller rather than an afterthought. (I've written more about this [here](link to API essay).) Some aren't: legacy systems often have APIs that were designed for human-shaped workflows, and an agent calling them runs into rate limits, brittle authentication, and missing capabilities. Vendor selection at this stage isn't just about features — it's about whether the tool surface is something an agent can actually drive.

The second decision is where the AI lives. The natural temptation is to build a chat interface and tell employees to use it. The right answer is almost always to integrate the AI into the tools people already use — Teams, Outlook, Slack, the ERP, the codebase. People don't want another window to check. They want the AI to show up where they're already working: a Slack message when the build breaks, a draft email in the queue when a lead comes in, a Jira comment when the ticket is ready to review. The integration work is more involved, but the adoption curve is dramatically better.

The third decision is authorization, again. Stage 2 was about controlling what the AI could _see_. Stage 3 is about controlling what the AI can _do_, and on whose behalf. When David's AI opens a pull request, it's not opening it as some service account — it's opening it as David, with David's permissions. When Marcus's AI posts an entry to the staging ledger, it has to be auditable as Marcus's action, with Marcus's authority. The user's identity has to flow through the AI to the system being acted on, and the system has to make the final call on whether the action is allowed. This is genuine engineering work, and it's the fastest path from _productive_ to _catastrophic_ if it's done wrong.

The fourth decision is review. Every action the AI takes has to be reviewable, both at the moment of the action and after the fact. David needs to see the diff before approving the PR. Marcus needs to be able to spot-check the staged entries. Auditors need to be able to reconstruct, weeks later, what the AI did and why. The review surface isn't a nice-to-have — it's the thing that makes governance possible at all. A stage 3 system without good review surfaces is a system that nobody will trust enough to actually use.

Stage 3 is where AI stops feeling like a tool and starts feeling like a member of the team. That's the right metaphor — and it's also why the engineering investment is so much higher. A team member needs an account, needs permissions, needs to be auditable, needs to be supervised when they're new and trusted when they've earned it. The companies that get stage 3 right are the ones that build for that reality from the start.

## Stage 4 — the unknown

![Stage 4 illustration](stage_4.png)

Every major technology eventually changes work, not just speeds it up.

When Gutenberg's press began producing books in the 1440s, the people paying attention thought the point was cheaper manuscripts — the same texts, reproduced faster, distributed more widely. Monks and scribes could see the efficiency argument clearly enough. What they could not see was that cheapening the cost of reproduction would shatter the institutional architecture that controlled who got to know what. Within decades, the Church's monopoly on textual interpretation was structurally untenable; Martin Luther's theses traveled faster than any condemnation could follow. The Scientific Revolution depended not just on new ideas but on the infrastructure to circulate, challenge, and build on them across borders. Mass literacy — once an elite credential — became, over the following centuries, a baseline expectation for ordinary workers. The scribe didn't get faster; the scribe's entire reason for existing dissolved, and an information economy emerged that no one in 1440 had a word for. Anyone who thinks AI will simply make today's knowledge workers more efficient is, in this sense, thinking like a monk watching the first press run.

When electric power reached American factories in the late nineteenth century, most owners understood it as a cleaner replacement for steam — same work, less soot, lower fuel costs. The early adoption numbers seemed to confirm that reading: output went up, costs came down. But electricity didn't just replicate what steam had done; it made possible something steam had structurally prevented. Steam-powered factories were organized around a single central shaft, with every machine mechanically coupled to it — layout was an engineering constraint, not a choice. Electricity dissolved that constraint entirely. Factories could be redesigned from scratch, production lines reconfigured, lighting extended into the night. Entirely new categories of work followed: the office economy — with its typewriters, filing clerks, and eventually computers — was an electrical artifact, not an industrial one. Refrigeration changed where people lived; radio changed how they understood the world; the suburb was, in a real sense, an electrical invention. The factory manager who adopted electricity expecting to run the same operation more cheaply ended up, a generation later, running something that bore almost no resemblance to what he had started with. The same reconfiguration — not just acceleration — is the pattern worth watching for now.

When the World Wide Web went mainstream in the 1990s, the dominant metaphor was the library — vast, searchable, available anywhere, and free. Businesses built websites the way they once bought Yellow Pages ads, assuming the point was visibility in a faster version of the existing market. What the internet actually did was dissolve the geographic constraint that had structured every market since markets existed. Retail, media, classified advertising, and travel all operated on the assumption that proximity and information asymmetry were permanent features of commerce; the internet revealed them as accidents of infrastructure. New business models emerged that had no pre-internet name — the platform, the attention economy, software as a service — and they didn't compete with existing businesses so much as replace the conditions those businesses depended on. The travel agent who built a website to book trips faster did not survive; the one who became a high-touch curator of complex, irreplaceable experiences sometimes did. The technology didn't redistribute existing advantages — it changed what the advantages were. That is the harder lesson, and it is the one that matters for AI: the question is not what AI can do for the workflows we already have, but what kind of work, what kind of organizations, and what kind of advantages will exist on the other side of a transition we are not yet positioned to see clearly.

### The pattern in the present

Andrej Karpathy, until recently the head of AI at Tesla, [tells a story](https://karpathy.bearblog.dev/sequoia-ascent-2026/) about an app he built called MenuGen. The premise is simple: you sit down at a restaurant, the menu has no pictures, and you don't know what half the dishes are. The app lets you upload a photo of the menu, OCRs the dish names, runs each through an image generator, and re-renders the menu with visuals next to each item. He built the whole thing — frontend, backend, Vercel deployment, authentication, payments. The full stack.

Then he watched someone do the same thing by handing the photo to Gemini with a one-line prompt: _overlay images of the dishes directly onto the menu image_. The model returned a single image — the original menu, with the dish photos rendered into the pixels. No OCR pipeline. No UI. No backend. No deployment. Just input and output.

His line: _all of MenuGen is spurious. It's working in the old paradigm. That app shouldn't exist._

A lot of what's being built right now is scaffolding around model limitations — temporary plumbing that exists only because the model couldn't do the whole thing yet. As models improve, entire product categories collapse into a prompt. The question isn't _how do we build the old apps faster?_ It's _which apps should stop existing?_

The electricity parallel here is almost exact. The factories that swapped the dynamo in for the steam engine and kept the old layout got forty years of near-zero productivity gains. The ones that rebuilt from scratch got compounding annual growth that left the others behind. The same is true now — at the level of software architecture, at the level of business processes, at the level of entire industries. The linear extrapolation of what exists is the wrong frame for where this lands.

### Why we can't write this stage yet

Stage 4 is the stage no one knows.

Right now, almost everything being built with AI is some version of doing existing work faster. That's not a criticism — speeding up the work that exists is the natural place to start, and stages 1 through 3 are exactly that work. But the companies that come out of this transition with structural advantages won't be the ones who got the most efficiency out of their old workflows. They'll be the ones who found genuinely new problems to solve, new shapes of work, new categories of value that don't have names yet.

And the shape of those problems isn't visible from where we're standing. The factory manager in 1890 couldn't have described the office economy. The publisher in 1995 couldn't have described social media. The visibility comes later, after enough people have lived inside the new technology long enough that the new shapes start to feel obvious. We're not there yet. We're at the beginning of the press run.

### Why stages 1–3 set this up

Here's the thing about stages 1 through 3: they don't just make the company more productive. They change how people think about their work.

By the end of stage 3, David isn't writing payment-flow regressions anymore. He's reviewing them, pattern-matching across them, deciding which ones reveal something structural that should be fixed at a higher level. Maya isn't assembling proposal sections anymore — she's deciding which pursuits are worth the firm's time, which scoring criteria matter, which agencies to invest in. Marcus isn't reconciling accounts — he's governing close, deciding what counts as an exception, deciding when a process needs to change. Their attention has moved up a level, and from that vantage point, things look different than they did before.

People who've lived that progression think about their jobs differently than they did before. They notice things they couldn't have noticed when they were heads-down doing the work. They have ideas that wouldn't have occurred to them otherwise. And they're the ones — not the consultants, not the executives, not the AI vendors — who will have the next big idea about how the work itself should change.

The travel agent who built a website to book trips faster didn't survive the web. The one who became a curator of complex, irreplaceable experiences sometimes did. The same selection pressure is coming. The advantage will go to the people whose attention has already moved up a level by the time the new shapes become visible.

### How to enable Stage 4

You can't enable Stage 4. You can only build the conditions for it.

The first thing is to walk your people through stages 1 through 3 deliberately. Not as a tooling rollout, not as an efficiency program — as a structured progression through how the work itself changes. Most companies are going to skim past the early stages because the early stages don't feel like real adoption. The companies that will benefit from stage 4 are the ones whose people actually lived stages 1 through 3, in their full depth, and came out the other side thinking differently about their jobs.

The second thing is to notice when an internal app starts looking like MenuGen. Most companies have backlogs full of half-built tools, scaffolding around model limitations from a year ago, products designed for a paradigm that's already shifted. The instinct will be to ship them, because they were already paid for. The discipline is to ask whether they should exist at all — and to be willing to throw them out when the answer is no.

The third thing is the hardest, and it's mostly cultural. You need to create an environment where someone — an analyst, an engineer, a proposal writer — can say _this shouldn't exist_ about something the company is currently doing, and be heard. Not punished, not redirected, not nodded at and ignored. Heard. The next big idea is going to come from someone whose attention has moved up a level and who can see, from that vantage, that something the company is doing now is in the way of where it needs to go. If that person can't say so out loud, the company won't get there.

That's the whole job at stage 4. Walk your people through the stages with care. Watch for the things that shouldn't exist. Build the room for the people who can see what's next to actually tell you about it. The rest — the new product, the new market, the new shape of work — will come from them, not from you. Your job is to make sure they have room to find it.
