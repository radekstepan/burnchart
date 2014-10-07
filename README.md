#burnchart.io

##Concept

GitHub Burndown Chart as a service. Public repos are free, for private access auth via GitHub and pay.

##Notes

- *payment gateways* in Canada: [Shopify](http://www.shopify.com/payment-gateways/canada), [Chargify](http://chargify.com/payment-gateways/) list; I get free processing on first $1000 with [Stripe](https://education.github.com/pack/offers)
- start people on a *Community* plan showing them a comparison table to upgrade to a better offering
- community (open source, local storage), business (private repos, firebase)
- keep discussion going via [gitter](http://gitter.im) or have people comment from the app via [helpful](https://helpful.io/)
- [credit card form](http://designmodo.com/ux-credit-card-payment-form/) ux from Designmodo
- workers: using a free instance of IronWorker and assuming 5s runtime each time gives us a poll every 6 minutes. Zapier would poll every 15 minutes but already integrates Stripe and FB.
- worst case scenario I provide even Small Business plan for free and provide a better experience
- $2.5 Node.js PaaS via Gandi with promo code `PAASLAUNCH-C50E-B077-A317`.
- let people vote on features they want to see fast: [tally.tl](http://tally.tl/).
- use [readme.io](https://readme.io/) for documentation
- have people pay outright or call me instead telling me what they'll use it for and they will get 6 months free; the idea is to get feedback from them; also, if they want to leave/close account/have not used app in a while, give them more free months for their feedback on how to make the app better; feedback is more important than money in early stages

##Plans

###Community

- your repos are saved locally
- no auto-updates to milestones, everything fetched on page load
- no private repos

###Business

- you need to pay for a license to use the app for business purposes
- repos, milestones saved remotely
- auto-update with new information
- private repos
