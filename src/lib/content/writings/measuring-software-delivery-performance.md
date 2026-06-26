---
title: Measuring Software Delivery Performance
date: June 14, 2026
order: 5
---

The notes below draw mostly on [Accelerate](https://www.amazon.com/Accelerate-Software-Performing-Technology-Organizations/dp/1942788339), with additional inspiration from [Team Topologies](https://www.amazon.com/Team-Topologies-Organizing-Business-Technology/dp/1942788819) and [The Phoenix Project](https://www.amazon.com/Phoenix-Project-DevOps-Helping-Business/dp/0988262509).

## Software delivery is a business outcome

To compete, organizations have to accelerate: faster delivery to customers, faster read on what the market wants, faster response to risks like security threats or a shifting economy. Software sits at the heart of all of it, whatever industry you're in.

In Accelerate, Nicole Forsgren, Jez Humble, and Gene Kim ran the numbers across tens of thousands of respondents and found a causal link between software delivery performance and organizational performance. Organizations that deliver software well are about twice as likely to beat their goals for profit, productivity, market share, and customer satisfaction [(2019 State of DevOps Report)](https://dora.dev/research/2019/dora-report/2019-dora-accelerate-state-of-devops-report.pdf).

The best part: speed and stability aren't a tradeoff. The fast teams are also the reliable ones. "Move fast and break things" is a false dichotomy.

## The odds are against us

Now the bad news. Software delivery is one of the most consequential things a company does… and one of the things companies are worst at.

In [How Big Things Get Done](https://www.tailwindproject.com/blog/how-big-things-get-done), Bent Flyvbjerg studied more than 16,000 large projects, asking how many finish on budget, on time, and on expectations. Half land on budget. Only 8.5% hit budget and schedule together. And just 0.5% — 1 in 200 — finish on budget, on time, and meet expectations.

Software is among the worst categories, and it fails with a fat tail. About 18% of IT projects overrun their budgets by more than 50%, and that group overruns by 447% on average. **Software projects that go wrong tend to go catastrophically wrong.**

But there's a way out. Accelerate found a class of high performers who run laps around their peers — shipping faster and breaking less. They aren't lucky, and they aren't doing anything secret. We've spent a long time, as an industry, figuring out exactly what sets them apart.

## Vanity metrics

Before we get to what works, it's worth clearing away what doesn't. There's a long history of trying to measure software team performance, and most attempts focus on productivity. They fail for two reasons. First, they measure outputs rather than outcomes. Second, they measure individual or local activity rather than team or global results. I call these vanity metrics.

- - **Lines of code:** Born in the mainframe era, when a programmer's output was literally counted in punch cards and KLOC. It doesn't work because more lines isn't better and fewer isn't either. Pay for volume and you get bloated, unmaintainable code; reward terseness and you get clever one-liners nobody can read. Either way you're measuring typing, not value.
- - **Velocity (story points):** Points entered the mainstream with Scrum as a planning aid — a way to forecast how much a team could take on in an iteration. It doesn't work as a performance metric because points are arbitrary, relative units that mean different things on different teams, so you can't compare across them. And the moment you make velocity a target, teams inflate their estimates and chase story count at the expense of the collaboration that actually ships software.
- - **Utilization:** The factory-floor instinct: keep everyone busy. It doesn't work because busyness isn't outcomes, and past a point high utilization actively backfires. With no slack in the system, there's no capacity to absorb unplanned work, and the timeframe from work planned to work finished gets longer, not shorter.
- - **Tokens:** The modern update to lines of code. An AI assistant can manufacture an unlimited supply of commits and lines, which means output has never been cheaper to produce or more worthless to count.

## The right metrics

We need measures of software performance that focus on a global outcome, so teams aren't pitted against each other. The measures also need to focus on outcomes instead of output. Four metrics, now known as the DORA metrics, have emerged over the last decade, distilled from a messy pile of practices adopted with varying success across the industry (Lean, Scrum, Extreme Programming, Scaled Agile, Continuous Delivery, DevOps).

- **Deployment frequency:** How often an organization ships code to production. A proxy for batch size and flow: teams that deploy daily or on demand are working in small, low-risk increments, while teams that deploy once a quarter are moving in big, risky lumps.
- **Lead time for changes:** How long it takes a committed change to reach users in production. It measures the responsiveness of the whole pipeline — how fast you can turn an idea, a fix, or a security patch into something customers actually have.
- **Change failure rate:** The percentage of deployments that cause a failure requiring remediation — a rollback, hotfix, or patch. It's the quality check on speed: it tells you whether you're shipping fast because you're good, or just shipping fast and breaking things.
- **Time to restore service:** How long it takes to recover when a change does cause a failure. In complex systems failure is inevitable, so what matters isn't just avoiding it but how quickly you bounce back.

Speed without stability is just recklessness; stability without speed is paralysis. High performers improve both at once, because the same practices that let you ship quickly (automation, small batches, fast feedback) are the ones that let you recover quickly when something breaks.

The real value of defining delivery performance this way is that it turns improvement into an empirical exercise. You can benchmark a team against others in the company and against the broader industry, and learn from what the best are doing.

Best of all, you can experiment. You can test hypotheses about which practices actually strengthen delivery. My teams have often picked one experiment in a retrospective and let it run for a few months. Then we come back, review the metrics, and determine whether to revert the change or officially incorporate it into our SDLC. The result is that everything in our process is there for a measured reason.

## Use metrics carefully

Metrics can help or hurt, depending on the culture they land in. That includes the DORA four. Ron Westrum, whose work Accelerate builds on, split organizations into three types by how they deal with information. In one, metrics drive improvement. In the other two, they turn into a way to control people.

- **Pathological.** Information gets hoarded and the messenger gets shot. Metrics become a weapon — used to assign blame and rank people. So people stop telling you the truth.
- **Bureaucratic.** Information moves through channels and dies there. Metrics get collected, put on a dashboard, and ignored. Reporting the number is the whole job.
- **Generative.** Information flows, failure is something you learn from, new ideas are welcome. A bad metric starts a conversation instead of ending a career. It's the only place where measurement actually leads anywhere.

The best way to read your culture is to ask the people inside it. There's no dashboard for it. You find out by asking whether information flows or gets buried, and whether failure is treated as a lesson or a liability.

I've learned that the metrics are the easy part. The culture is what takes time. But it's worth the effort. Get both right and you can be the 1 in 200 that ships on time, on budget, and ahead of the competition.