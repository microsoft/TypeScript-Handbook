
In priority order

 * Document `typings` / `tsd` -> `@types` transition
 * Rename `scripts` to `_scripts`
 * Create and finish `_template` documentation and folder
 * Ensure no `notNeeded` / `external` / local conflicts (already done?)
 * Warn in README.md if `noImplicitAny` is off
 * Include "last updated" date in README.md
 * Figure out what to do with DT issue backlog
 * Create bugs for any remaining bad-format files
 * Endorse in README.md if `strictNullChecks` is on
 * Add stat reporting on how many files are still `noImplicitAny: false`
   * Eventually: validate all `tsconfig.json` files for conformance
 * Add stat reporting on how many files are `strictNullChecks`
   * Include this metadata in `package.json` so we can warn/bless
 * Support moving authors to sidecar file in case list gets too long


Random thoughts

 * Game-ify DT -- e.g. what if definition files were awarded gold / silver / bronze medals?
   * Platinum: Uses string enums, etc (hand-validated)
   * Gold: Strict null checked
   * Silver: JSDoc on 60%+ of members
   * Bronze: No use of `any`
   * Identify popular non-gold libraries, TypeScript team upgrades 1 / week
   * Use to improve search relevance
   * Send PRs of gold+-quality .d.ts files to underlying package's github pages to add badges
   * Prizes? Bounties? What would $10,000 of .d.ts upgrades look like?
     * Funding pitch: Easily saves us 2 weeks of work, great PR?
 * 
