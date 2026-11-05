# Unitbox AdSense resubmission checklist

Last reviewed: 2026-11-05

## Content and structure

- [ ] The three scenario guides have a live calculator, practical guidance, FAQ, related conversions and a reference link.
- [ ] The Reference hub links to the dataset, metric/imperial guide, temperature formulas, conversion-factor method, embed guide and publisher resources.
- [ ] The priority conversion pages contain a specific use note and a relevant internal reference; no page is published merely to create another URL.
- [ ] About, Methodology, Privacy and Terms are linked from the footer and reflect the current site behaviour.

## Advertising and privacy

- [ ] Ads are not displayed inside the calculator interaction, on empty states, or on navigation-only screens.
- [ ] An advertisement label is visible above every Google-served ad slot.
- [ ] No page contains more ads than useful publisher content.
- [ ] Privacy policy discloses Google advertising technologies and points to Google's partner-sites disclosure.
- [ ] If personalised ads are enabled in the EEA, UK or Switzerland, a compatible consent-management flow is live before requesting review.

## Technical checks

- [ ] `npm run build` passes.
- [ ] `npx vitest run` passes.
- [ ] `git diff --check` is clean.
- [ ] `https://unitbox.online/robots.txt`, `/sitemap-index.xml`, `/privacy`, `/terms`, `/about` and `/methodology` return 200.
- [ ] The deployed homepage, three scenario pages and five reference pages have a canonical URL, a unique title and a meta description.

## Search Console baseline

Record this immediately before submitting the review, then repeat every Monday for four weeks.

| URL group | Impressions | Clicks | CTR | Avg. position | Notes |
| --- | ---: | ---: | ---: | ---: | --- |
| Homepage |  |  |  |  |  |
| Scenario guides |  |  |  |  |  |
| Reference hub and guides |  |  |  |  |  |
| Priority conversion pages |  |  |  |  |  |

The scheduled observer writes raw GSC snapshots to `.observe/YYYY-MM-DD/gsc.json`. Run `node scripts/fetch-gsc.mjs --verify` to verify the service-account connection, and `node scripts/submit-gsc-sitemap.mjs` after a production deployment when the service account has Search Console write access.

## Submit only when true

Do not request another review until every relevant checkbox is complete and the production site—not only the local build—has been checked. Approval timing and outcome remain Google's decision.
