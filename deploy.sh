#!/usr/bin/zsh

# abort on errors
set -e

# remove old dist
rm -rf src/dist

# build
npm run build

# navigate into the build output directory
cd src/dist

git init

git add .

git commit -m "deploy"

git remote add origin git@github.com:kaangiray26/allesgut.git

git push --force origin main:gh-pages

cd ../..