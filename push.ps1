Set-Location "C:\Users\pang_\OneDrive\Apps\detctDrawing"
git rm -r --cached .next 2>&1 | Out-Null
git add -A
git commit -m "feat: add Navbar, ARC Hub, Reports pages, fix OneDrive junction, update Supabase credentials"
git push origin main
Write-Host "DONE"
