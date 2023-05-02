@REM wt wsl -e bash -lic ./ccstart1.sh


wt --window 0 new-tab --title "CC Debug" --tabColor "#0F0" wsl -e bash -lic ./startdebug.sh
wt --window 0 new-tab --title "Orderer" --tabColor "#F00" wsl -e bash -lic ./startorderer.sh