@REM wt wsl -e bash -lic ./ccstart1.sh


wt --window 0 new-tab --title "CC Debug" --tabColor "#0F0" wsl -e bash -lic ./ccstart2.sh
wt --window 0 new-tab --title "order" --tabColor "#F00" wsl -e bash -lic ./ccstart1.sh