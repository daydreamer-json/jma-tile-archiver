@echo off&chcp 65001&cd /d %~dp0&cls


:looper
prettier --write src\**\*
npx tsc
node dist\main.js test --thread 32 --np
timeout /t 120
goto looper
