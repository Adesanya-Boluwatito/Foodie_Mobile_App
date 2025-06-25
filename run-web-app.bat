@echo off
echo Starting Foodie Web App...
cd /d %~dp0
cd foodie-web-app
call npm run dev 