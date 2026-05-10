1. /Users/mac/tharo/src/patterns/index.ts:145
  return messages.join(" ").toLowerCase();
                  ^

TypeError: messages.join is not a function
    at joinMessages (/Users/mac/tharo/src/patterns/index.ts:145:19)
    at Object.urgency (/Users/mac/tharo/src/patterns/index.ts:161:19)
    at <anonymous> (/Users/mac/tharo/test-methara/src/index.ts:7:25)
    at ModuleJob.run (node:internal/modules/esm/module_job:437:25)
    at async node:internal/modules/esm/loader:639:26
    at async asyncRunEntryPointWithESMLoader (node:internal/modules/run_main:101:5)

Node.js v24.15.0
mac@Rapto-Macbook-Pro test-methara %
