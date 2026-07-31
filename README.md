# React Financial Charts

> **Note:** this repo is a fork of [react-financial-chart](https://github.com/react-financial/react-financial-charts), renamed, bug fixes applied due to the original project being unmaintained.

> **Note:** v1 is a fully breaking change with large parts, if not all, rewritten. Do not expect the same API! although the same features should exist.

[![ci](https://img.shields.io/github/actions/workflow/status/riyazpanarwala/react-financial-charts/ci.yml?branch=main&label=ci)](https://github.com/riyazpanarwala/react-financial-charts/actions)
[![GitHub license](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/riyazpanarwala/react-financial-charts/blob/main/LICENSE) [![npm version](https://img.shields.io/npm/v/@riyazpanarwala/react-financial-charts.svg?style=flat)](https://www.npmjs.com/package/@riyazpanarwala/react-financial-charts)

Charts dedicated to finance.

The aim with this project is create financial charts that work out of the box.

## Features

-   integrates multiple chart types
-   technical indicators and overlays
-   drawing objects

### Chart types

-   Scatter
-   Area
-   Line
-   Candlestick
-   OHLC
-   HeikenAshi
-   Renko
-   Kagi
-   Point & Figure

### Indicators

-   EMA, SMA, WMA, TMA
-   Bollinger band
-   SAR
-   MACD
-   RSI
-   ATR
-   Stochastic (fast, slow, full)
-   ForceIndex
-   ElderRay
-   Elder Impulse

### Interactive Indicators

-   Trendline
-   Fibonacci Retracements
-   Gann Fan
-   Channel
-   Linear regression channel

---

## Installation

```sh
npm install @riyazpanarwala/react-financial-charts
```

## Requirements

-   Node.js `>= 20.0.0`
-   npm `>= 10.0.0`
-   React `^18.0.0 || ^19.0.0`

## Documentation

To view the interactive Storybook documentation locally, run:

```bash
npm start
```

## Contributing

Refer to [CONTRIBUTING.md](./CONTRIBUTING.md)

This project is a mono-repo that uses [npm Workspaces](https://docs.npmjs.com/cli/v10/using-npm/workspaces) to manage dependencies between packages.

To get started run:

```bash
git clone https://github.com/riyazpanarwala/react-financial-charts.git
cd react-financial-charts
npm ci
npm run build
```

To start up a development server run:

```bash
npm start
```

### Useful Scripts

- `npm run build`: Builds all workspace packages in topological order.
- `npm start`: Launches Storybook development environment.
- `npm test`: Runs unit test suites across all packages.
- `npm run lint`: Runs ESLint 9 across the monorepo.

## Roadmap

-   [x] Convert to typescript
-   [x] Bump dependencies to latest
-   [x] Remove React 16 warnings
-   [x] Add CI
-   [x] Fix passive scrolling issues
-   [x] Implement PRs from react-stockcharts
-   [x] Add all typings
-   [x] Move examples to storybook
-   [x] Add all series' to storybook
-   [x] Split project into multiple packages
-   [x] Fix issues with empty datasets
-   [x] Correct all class props
-   [x] Migrate to new React Context API
-   [x] Remove all UNSAFE methods
-   [x] Migrate from Lerna to npm Workspaces
-   [x] Upgrade to React 19 & Node 22
-   [x] Upgrade Storybook to v8 & Vite 6
-   [x] Upgrade ESLint to v9 (Flat Config)
-   [x] Add automated NPM publishing scripts
-   [ ] Add documentation to storybook
-   [ ] Add full test suite

## LICENSE

[MIT](./LICENSE)
