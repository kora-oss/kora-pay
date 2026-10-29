# kora-pay

Pricing and billing helpers for Node.js.

> **This is a practice repo** for the [SKILL.SCH Open Source Contributor & Maintainer course](https://skill.sch/open-source).
> It has bugs on purpose (a crash with 0 seats, a flaky test) so you can find and fix them.
> Fork it, break it, open pull requests against your fork. Have fun.

```js
const { calculatePrice } = require("kora-pay");
calculatePrice("pro", 5); // 50.00
```

## Run it

```bash
npm install
npm test                      # unit tests
docker compose up -d          # start Postgres 16
npm run test:integration      # integration tests against the real database
node phases.js                # event-loop drills: phases.js, loop1.js ... loop5.js
```
