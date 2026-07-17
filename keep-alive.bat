@echo off
setlocal

set AUTH_URL=https://auth-user-management-5jun.onrender.com/api/auth/claim-status
set CONSULTATION_URL=https://consultation-service-gnsu.onrender.com/api/consultation/businesses
set NOTIFICATION_URL=https://notification-service-7t58.onrender.com/api/notifications/unsubscribe
set HOME_URL=https://home-controller-8t7q.onrender.com/api/home
set INTERVAL_SECONDS=600

:loop
echo [%date% %time%] Pinging auth-service...
curl -s -o nul -w "auth-service: %%{http_code}\n" "%AUTH_URL%"

echo [%date% %time%] Pinging consultation-service...
curl -s -o nul -w "consultation-service: %%{http_code}\n" "%CONSULTATION_URL%"

echo [%date% %time%] Pinging notification-service...
curl -s -o nul -w "notification-service: %%{http_code}\n" "%NOTIFICATION_URL%"

echo [%date% %time%] Pinging home-controller...
curl -s -o nul -w "home-controller: %%{http_code}\n" "%HOME_URL%"

timeout /t %INTERVAL_SECONDS% /nobreak >nul
goto loop
