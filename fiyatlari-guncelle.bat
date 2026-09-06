@echo off
chcp 65001 > nul
title Aceleetme.tech Fiyat Güncelleme Motoru
echo ====================================================
echo 🛡️  ACELEETME.TECH CANLI FİYAT GÜNCELLEME  🛡️
echo ====================================================
echo.
echo Hepsiburada fiyatları taranıyor, doğrulanıyor ve kaydediliyor...
echo Lütfen pencereyi kapatmayın.
echo.

node scripts/nightlyPriceSync.js --limit=50 --push

echo.
echo ====================================================
echo İşlem tamamlandı. Çıkmak için herhangi bir tuşa basın.
echo ====================================================
pause > nul
