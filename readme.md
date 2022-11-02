# `vite-esbuild-jsx` issue

This repo demonstrates an issue with [`esbuild-jsx` PR](https://github.com/vitejs/vite/pull/9590) for Vite.

To replicate, you should modify `pnpm.overrides` in `package.json` to point to a local Vite repo clone on the `rtsao/esbuild-jsx` branch.

The you can simply `pnpm i` and `pnpm dev` to see the issue.

## Before this PR

### `restoreJsx` doesn't work on optimized deps

It works as expected if the dep is added to `optimizeDeps.exclude` but it doesn't work for optimized deps (the common case) because the `parseReactAlias` function looks for a simple `require("react")` or `import ... from "react"` pattern but optimized deps look more like this:

```js
import { __toESM, require_react } from "./chunk-HJ2HJDBH.js";
var import_react = __toESM(require_react());
// ...
import_react.default.createElement(/* ... */);

// ...

var import_react2 = __toESM(require_react());
// ...
import_react2.default.createElement(/* ... */);
```

and to me this looks exceedingly difficult to parse correctly and in a fool-proof way.

## After this PR

### `restoreJsx` result is thrown away

It still doesn't work for optimized deps as before. But now, it still doesn't work even if we add it to `optimizeDeps.exclude`. The transform is applied, but the result is thrown away because the `shouldSkip` test checks for `plugins.length` and it will be zero for non-project files (previously it would include at least the JSX transform itself).

### `restoreJsx` is applied late

You can still make the `restoreJsx` transform work. There are a few ways:

- Add the dep to `optimizeDeps.exclude` and add a Babel config file (even `module.exports = {}` is enough)
- Add the dep to `optimizeDeps.exclude` **in a monorepo** (so it's considered a project file) and a plugin is added

In this case `restoreJsx` is applied too late (_after_ ESBuild's JSX transform) and will compile `React.createElement` calls back to JSX, which will never be compiled again. And obviously there will be errors in various stages, like the one below:

```
[vite] Internal server error: Failed to parse source for import analysis because the content contains invalid JS syntax. If you are using JSX, make sure to name the file with the .jsx or .tsx extension.
```
