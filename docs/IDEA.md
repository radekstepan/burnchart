#Idea

##Summary

An app showing a burndown chart for issues in a GitHub milestone. A choice of strategies for calculating the size of each issue to determine the progress. Running completely client-side apart from GitHub authentication via a Firebase service. In use by the community since 2012.

##Community

Anyone can contibute their time by working on issues. Read the [Architecture](ARCHITECTURE.md) document to get oriented. Ours are tracked in Assembly as [bounties](https://assembly.com/burnchart/bounties). You can use the contact form widget inside the app or [burnchart@helpful.io](mailto:burnchart@helpful.io) to contact the lead developer, Radek. You can also use [Tally](http://tally.tl/) to vote on upcoming features.

##Background

The project started in 2012 at the University of Cambridge in a bioinformatics team. The aim was to get better at estimating the workload for each release we were marking. The original app was running on Node.js. Then a major rewrite in 2013 moved it completely client side. Another rewrite is happening now, 2014, on the Assembly platform.

##Goals

Make developers better at managing their workload. 

##Key Features

1. Running from the **browser**, apart from GitHub account sign in which uses Firebase backend.
1. **Private repos**; sign in with your GitHub account.
1. **Store** projects in browser's `localStorage`.
1. **Off days**; specify which days of the week to leave out from ideal burndown progression line.
1. **Trend line**; to see if you can make it to the deadline at this pace.
1. Different **point counting** strategies; select from 1 issues = 1 point or read size from issue label.

##Target Audience

Developers who use simple issue trackers like GitHub issues and want to graduate from the basic progress bar that GitHub provides.

##Competing Products

The burndown or burndown chart concept is pretty widespread in more enterprisey ([Jira](https://www.atlassian.com/software/jira), [PivotalTracker](http://www.pivotaltracker.com/), [ThoughtWorks](http://www.thoughtworks.com/products/mingle-agile-project-management)) software. These are too heavy.

There are also products that nicely integrate with GitHub ([AgileZen](http://www.agilezen.com/), [Scrumwise](https://www.scrumwise.com/features.html)). But these are not GitHub-first.


And finally products built on top of the GitHub API ([Burndown](http://burndown.io/), [SweepBoard](http://sweepboard.com/)). One is not pretty and one does not do charts yet.

This product puts the chart front and centre, as a place from which insights can be gained. Some people use Kanban boards, we use Burncharts.

##Monetization Strategy

I think that this product is useful but, like with [gitter.im](https://gitter.im/) or [david-dm.org](http://david-dm.org) hasn't reached a threshold where people would pay for it.