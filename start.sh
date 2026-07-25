#!/bin/bash
cd server
npm install
npx prisma generate
npx prisma db push
npm start
