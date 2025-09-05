> Disclaimer:
> 
> This is NOT a finished product or polished code and has little to NO guardrails when used `wrong`.
> It will shoot you in the foot and be happy while doing it. Use at your own risk.

### So, why then I'm publishing this?

I needed to migrate a domain between US and EU regions within the same account and to keep all the mailing lists, members, each lists config etc. Copy-pasting some DNS settings is little and easy, but replicating 10s of lists and hundreds of members is not fun anymore. This is a one-off process, doing full tool inside CMS didn't make sense, yet still takes time and consideration to do it right.

There is no built-in feature in Mailgun or other tools (that I could find) to do that. Maybe, just maybe, you have a similar need and are looking for a starting point.

### What it can do?

* Migrate single list or all lists found
* Migrate lists between regions within the same account
* Migrate lists between two different accounts
* Migrate members between different lists
* etc

All is up to changing some .env variables and maybe little bit of code adjust.

### The main points of interest

`src/migrate-lists.js` - it holds the most useful function and accepts following arguments - `source list address`, `destination list address`, `source account` and `destination account`. Most of the time, source and destination accounts are the same, but splitting them out opens a lot of possibilities.

The `index.js` implements this function in couple of ways, so a bunch of simple API calls become nicely orchestrated time saver:

* to migrate a single list
* to migrate all lists found in the source account
* compare the source/destination accounts and show basic stats

In your case, most likely you will change the modes in index.js to suit your needs.

```
Usage: index [options]

Options:
  -a, --address <string>  mailing list address to migrate
  -t, --to <string>       mailing list address to migrate to (if different). Used with --address
  -d, --delete            delete odd members in region B
  --all                   migrate all lists from region A to region B
  --clear-cache           clear cache before running
  --compare               Compare two accounts
  -h, --help              display help for command
```


This could have a lots of improvements - tests, sdk, dry mode, force mode, filters etc. But, frankly, as soon as I got it working all the way I need, one 5 minute run, and I was done adding improvements. No more future updates planned, use for inspiration or as a starting point for your own tool.