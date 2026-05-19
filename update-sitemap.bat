@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
title RoxyNime - Update Sitemap Cache
cd /d "%~dp0"

echo ============================================
echo   RoxyNime Sitemap Cache Update
echo ============================================
echo.

:: ══════════════════════════════════════════════
:: 0. CEK APAKAH GIT TERSEDIA
:: ══════════════════════════════════════════════
set GIT_AVAILABLE=0
where git >nul 2>&1
if ERRORLEVEL 1 (
    echo [!] Git tidak ditemukan di PATH — skip git operations.
) else (
    set GIT_AVAILABLE=1
)
echo.

:: ══════════════════════════════════════════════
:: 1. PARSE CRON_SECRET dari .env.local
:: ══════════════════════════════════════════════
echo [*] Reading CRON_SECRET from .env.local...
if not exist ".env.local" (
    echo [!] .env.local TIDAK DITEMUKAN
    echo     Pastikan file .env.local ada di root project
    pause
    exit /b 1
)

set CRON_SECRET=
for /f "usebackq tokens=1,* delims==" %%a in (`findstr /b "CRON_SECRET" ".env.local" 2^>nul`) do (
    set "CRON_SECRET=%%b"
    set "CRON_SECRET=!CRON_SECRET: =!"
    set "CRON_SECRET=!CRON_SECRET:"=!"
    set "CRON_SECRET=!CRON_SECRET:'=!"
)

if "!CRON_SECRET!"=="" (
    echo [!] CRON_SECRET tidak ditemukan di .env.local
    echo     Pastikan baris: CRON_SECRET=xxxxxxxxxx
    pause
    exit /b 1
)
echo [OK] CRON_SECRET loaded: !CRON_SECRET:~0,8!...
echo.

:: ══════════════════════════════════════════════
:: 2. CHECK DEV SERVER STATUS
:: ══════════════════════════════════════════════
echo [*] Checking localhost:3000...
curl -s -o NUL -w "%%{http_code}" http://localhost:3000 > "%TEMP%\sitemap_check.txt" 2>&1
set /p HTTP_STATUS=<"%TEMP%\sitemap_check.txt"
del "%TEMP%\sitemap_check.txt" 2>nul

echo     HTTP Status: %HTTP_STATUS%

echo %HTTP_STATUS% | findstr /r "^2[0-9][0-9]$" >nul && goto :server_ok
echo %HTTP_STATUS% | findstr /r "^3[0-9][0-9]$" >nul && goto :server_ok

echo [!] Dev server TIDAK BERJALAN (status: %HTTP_STATUS%).
echo     Tolong jalankan dulu: npm run dev
echo     Lalu re-run script ini.
pause
exit /b 1

:server_ok
echo [OK] Dev server is running!
echo.

:: ══════════════════════════════════════════════
:: 3. ESTIMASI WAKTU
:: ══════════════════════════════════════════════
echo ============================================
echo   ESTIMASI WAKTU (rate limit: 1500ms/req)
echo ============================================
echo   Phase 1 (anime)   : ~60 hal x 1500ms = ~90 detik
echo   Phase 2 (movies)  : ~10 hal x 1500ms = ~15 detik
echo   Phase 3 (episode) : ~35 detik
echo   ------------------------------------------------
echo   TOTAL ESTIMASI    : ~140 detik (~2.5 menit)
echo ============================================
echo.

set START=%time%

:: ══════════════════════════════════════════════
:: 4. PHASE 1 — FETCH ANIME
:: ══════════════════════════════════════════════
echo [1/3] Phase 1: Fetching anime...
echo        (estimasi ~90 detik...)
echo.
curl -s -H "Authorization: Bearer !CRON_SECRET!" ^
  "http://localhost:3000/api/cron/rebuild-sitemap-cache?phase=1" ^
  -w "\n[HTTP Status: %%{http_code}]\n"
echo.
echo [OK] Phase 1 complete.
echo.

:: ══════════════════════════════════════════════
:: 5. PHASE 2 — FETCH MOVIES
:: ══════════════════════════════════════════════
echo [2/3] Phase 2: Fetching movies...
echo        (estimasi ~15 detik...)
echo.
curl -s -H "Authorization: Bearer !CRON_SECRET!" ^
  "http://localhost:3000/api/cron/rebuild-sitemap-cache?phase=2" ^
  -w "\n[HTTP Status: %%{http_code}]\n"
echo.
echo [OK] Phase 2 complete.
echo.

:: ══════════════════════════════════════════════
:: 6. PHASE 3 — FETCH EPISODES
:: ══════════════════════════════════════════════
echo [3/3] Phase 3: Fetching episodes...
echo        (estimasi ~35 detik...)
echo.
curl -s -H "Authorization: Bearer !CRON_SECRET!" ^
  "http://localhost:3000/api/cron/rebuild-sitemap-cache?phase=3" ^
  -w "\n[HTTP Status: %%{http_code}]\n"
echo.
echo [OK] Phase 3 complete.
echo.

set END=%time%

:: ══════════════════════════════════════════════
:: 7. VERIFIKASI CACHE FILES
:: ══════════════════════════════════════════════
echo ============================================
echo   Verifying cache files...
echo ============================================
for %%F in (anime-list watch-list movies-list) do (
    if exist "public\cache\%%F.json" (
        for %%A in ("public\cache\%%F.json") do (
            echo [OK] %%F.json — %%~zA bytes
        )
    ) else (
        echo [!!] %%F.json — MISSING
    )
)
echo.
echo   Mulai  : %START%
echo   Selesai: %END%
echo.

:: ══════════════════════════════════════════════
:: 8. GIT ADD + COMMIT + PUSH
:: ══════════════════════════════════════════════
if %GIT_AVAILABLE% NEQ 1 (
    echo [!] Git tidak tersedia — skip git push.
    goto :done
)

echo ============================================
echo   Git commit and push...
echo ============================================

for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value 2^>nul') do set DT=%%I
set TODAY=%DT:~0,4%-%DT:~4,2%-%DT:~6,2%

git add public\cache\anime-list.json ^
        public\cache\watch-list.json ^
        public\cache\movies-list.json ^
        public\sitemap*.xml ^
        public\sitemap-index.xml 2>&1
echo [OK] git add — OK

git diff --cached --quiet 2>&1
if ERRORLEVEL 1 (
    git commit -m "chore: update sitemap cache [%TODAY%]" 2>&1
    if ERRORLEVEL 1 (
        echo [!] git commit gagal.
    ) else (
        echo [OK] git commit — OK
        git push origin main 2>&1
        if ERRORLEVEL 1 (
            echo [!] git push GAGAL — cek koneksi atau jalankan manual: git push origin main
        ) else (
            echo [OK] git push — OK
            echo [OK] Vercel akan auto-deploy dalam ~30 detik
        )
    )
) else (
    echo [i] Tidak ada perubahan — skip commit.
)

:done
echo.
echo ============================================
echo   SELESAI — Sitemap cache updated!
echo ============================================
echo.
echo   Test lokal   : http://localhost:3000/sitemap-index
echo   Test live    : https://www.roxy.my.id/sitemap-index
echo.
echo   Google Search Console — Daftarkan DUA:
echo     [1] sitemap-index
echo     [2] sitemap_pages.xml
echo.
pause