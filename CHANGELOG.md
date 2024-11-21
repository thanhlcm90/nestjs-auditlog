# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [1.5.4](https://github.com/thanhlcm90/nestjs-auditlog/compare/v1.5.2...v1.5.4) (2024-11-21)


### Bug Fixes

* add data comparator to log ([b5a8eb4](https://github.com/thanhlcm90/nestjs-auditlog/commit/b5a8eb4c687cf400c80dd68fcb865e3b4ccd1dd1))
* add service info to clickhouse logs ([be2b193](https://github.com/thanhlcm90/nestjs-auditlog/commit/be2b19342f1e19822957c29758c8527756f1cc80))
* create clickhouse client when bootstrap module ([5c81149](https://github.com/thanhlcm90/nestjs-auditlog/commit/5c8114997cb23d851521f3ade3612b537f8e6544))
* save clickhouse created_at UTC time ([e7b107e](https://github.com/thanhlcm90/nestjs-auditlog/commit/e7b107e1a33e603746dc901bafdef76b312f02f9))

### [1.5.2](https://github.com/thanhlcm90/nestjs-auditlog/compare/v1.5.0...v1.5.2) (2024-11-21)

## [1.5.0](https://github.com/thanhlcm90/nestjs-auditlog/compare/v1.4.0...v1.5.0) (2024-11-21)


### Features

* add new exporter to push log into ClickHouse ([61f75cb](https://github.com/thanhlcm90/nestjs-auditlog/commit/61f75cbd62ec45cef60e9f7aaa92d242228b17d8))

## [1.4.0](https://github.com/thanhlcm90/nestjs-auditlog/compare/v1.2.0...v1.4.0) (2024-07-15)


### Features

* add APM trace ([bf40d38](https://github.com/thanhlcm90/nestjs-auditlog/commit/bf40d38e8ddcfdaec2dbc7245fa75c7f2e72fd10))

## [1.2.0](https://github.com/thanhlcm90/nestjs-auditlog/compare/v1.1.4...v1.2.0) (2024-05-21)


### Features

* field mapping can get from response ([ac62ecd](https://github.com/thanhlcm90/nestjs-auditlog/commit/ac62ecda89c03ea1d2b3328ac060089bda763692))
* improve auditlog exporter with shutdown event ([06e71cd](https://github.com/thanhlcm90/nestjs-auditlog/commit/06e71cd49e1c6357e648bf387511af01bad774ae))
* support resource.id with array of string values ([c78e6fa](https://github.com/thanhlcm90/nestjs-auditlog/commit/c78e6faade93625cf0ad6d46b19f919a3fae6bae))

### [1.1.4](https://github.com/thanhlcm90/nestjs-auditlog/compare/v1.1.0...v1.1.4) (2024-05-16)


### Bug Fixes

* move opentelemetry to dependencies ([05523c0](https://github.com/thanhlcm90/nestjs-auditlog/commit/05523c0854443ba851c5ce7e7662cf9289d8c320))
* move request-ip to dependencies, remove lodash ([4cf4305](https://github.com/thanhlcm90/nestjs-auditlog/commit/4cf43050d23772db36378b251c63a6df7393271a))

## [1.1.0](https://github.com/thanhlcm90/nestjs-auditlog/compare/v1.0.0...v1.1.0) (2024-05-15)


### Features

* add Coveralls GitHub Action ([5ef2917](https://github.com/thanhlcm90/nestjs-auditlog/commit/5ef2917f3ad081714761cceccfbedfb52deb2f54))
* add more decorators, improve decorator option, add more unittest ([2d926fc](https://github.com/thanhlcm90/nestjs-auditlog/commit/2d926fc34291b1dd11bb411be4d09aab4bd620c5))
