#burnchart.io

##Concept

GitHub Burndown Chart as a service. Answers the questions "are my projects on track"?

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
- send handwritten thank you cards to the first customers
- use [DigitalOcean](https://www.digitalocean.com/) as a GitHub Student (@bath.edu email) to get $100 in platform credits which translates to 20 months on the slowest (fast enough) dyno
- payments need to be automatic, why penalize users that are loyal to us with a burden of an admin task?
- ability to use the program needs to be frictionless; jump straight into the action, fill in data behind the scenes etc.
- send reminders to people whose account is expiring
- [Waffle](https://waffle.io/) from Rally software has a kanban board that will support [burnup chart](https://waffle.io/waffleio/waffle.io/cards/53e5347682b317f7d9ad6eac); it will charge $7/month

##Plans

###Community Plan

- your repos are saved locally
- no auto-updates to milestones, everything fetched on page load
- no private repos

###Business Plan

- you need to pay for a license to use the app for business purposes
- repos, milestones saved remotely
- auto-update with new information
- private repos

###Free Forever Business Plan (= Community Shareholder/Partners Plan)

I can't sell people on free membership, that is only a small incentive. But I can sell them on an app that does what they want. Have early access to features etc. If someone sees that my app can help them, why not tell me about it so I can make it happen?

I could also provide people with Assembly coins for each feedback session I've had with them, thus making them share in the profits. They are basically startup members with equity by being Product Developers.

To qualify, these people need to be businesses actively using the software. Thus being standin-users for other such $ paying businesses.

Let me call you every 3 months to ask how you are doing, how you are using the software, what can I improve, and you will get 3 months usage for free. The idea is to keep in touch with the most loyal customers, to hear them say how great/shabby the app is. If they don't want to talk they can always pay for the Business Plan.

If someone stops using the app, send them an email asking them for a good time to call so I can make things right. They would get 3 months usage as well.