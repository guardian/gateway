# Dependency upgrades

> Year after circling year, the ring upon a finger thins from inside out with
> wear. The steady drip of water causes stone to hollow and yield. The curving
> iron of the ploughshare fritters in the field by imperceptible degrees. The
> cobbles of the street we see are polished smoothly by now from throngs of
> passing feet.
>
> Lucretius, _De Rerum Natura_
>
> You become responsible, forever, for what you have tamed.
>
> Antoine de Saint-Exupéry, _The Little Prince_

We should, if possible, update our NPM packages weekly, for they too will decay
and reveal security vulnerabilities. Here is a general workflow for so doing:

1. Dependabot will add some PRs for necessary dependency upgrades to our PRs
   list. This is your call to action, your batsignal!
2. Create a new branch: `git checkout -b initials/deps-y-m-d`.
3. Find the previous dependencies PR, which will have a list of packages which
   have been held back for various reasons.
4. Run `yarn upgrade-interactive --latest` to see a list of all packages which
   _can_ be upgraded. Navigate the view with the arrow keys and select packages
   with Space. Confirm your upgrade changes with Enter.
5. Upgrade the packages in batches. First perform the semver patch and minor
   updates, followed by individual major updates, unless any of these updates
   are being held back.
6. After every batch, test the app by running commands such as `make dev`, `yarn jest`, `yarn run cypress`, and `yarn tsc`. Various packages will of course be best tested by various commands and sanity checks.
7. Once it looks like the update is working, commit that batch of changes.
8. Once all your changes are in, make sure to run GitHub CI and have your PR
   reviewed.

**N.B.**: if the changes required to make a package upgrade are looking
like they're going to take longer than 20 minutes to implement, don't get stuck
implementing them in the dependencies PR! Make a new PR and tackle them later,
and more in depth.
