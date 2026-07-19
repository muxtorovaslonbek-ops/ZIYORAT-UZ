#!/bin/bash
# Vercel build script — monorepo root dan ishga tushiriladi
cd artifacts/ziyorat-uz
pnpm install
pnpm run build
