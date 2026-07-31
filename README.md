# React Financial Charts

> **Note:** this repo is a fork of [react-financial-chart](https://github.com/react-financial/react-financial-charts), renamed, bug fixes applied due to the original project being unmaintained.

> **Note:** v1 is a fully breaking change with large parts, if not all, rewritten. Do not expect the same API! although the same features should exist.

[![ci](https://github.com/riyazpanarwala/react-financial-charts/actions/workflows/ci.yml/badge.svg)](https://github.com/riyazpanarwala/react-financial-charts/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/riyazpanarwala/react-financial-charts/branch/master/graph/badge.svg)](https://codecov.io/gh/riyazpanarwala/react-financial-charts)
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

## Documentation

[Stories](https://react-financial.github.io/react-financial-charts/)

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
-   [ ] Add documentation to storybook
-   [ ] Add full test suite

## LICENSE

[![FOSSA Status](https://app.fossa.com/api/projects/custom%2B13613%2Fgit%40github.com%3Areactivemarkets%2Freact-financial-charts.git.svg?type=large)](https://app.fossa.com/projects/custom%2B13613%2Fgit%40github.com%3Areactivemarkets%2Freact-financial-charts.git?ref=badge_large)
