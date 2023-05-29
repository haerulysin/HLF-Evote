@REM wt wsl -e bash -lic ./ccstart1.sh


wt;--window 0 new-tab --title "CC Debug" --tabColor "#4FC54D" -d ./ powershell -noExit wsl -e bash -lic ./startcc.sh; --window 0 new-tab --title "Peer Debug" --tabColor "#A661C2" wsl -e bash -lic ./startdebug.sh; --window 0 new-tab --title "Orderer" --tabColor "#F00" wsl -e bash -lic ./startorderer.sh
@REM --window 0 new-tab --title "REST API" --tabColor "#475B67" -d ./rest-api-ts powershell -noExit "npm run dev"; 