@echo off
chcp 65001 > nul
title Aceleetme.tech Fiyat Güncelleme Motoru
echo ====================================================
echo 🛡️  ACELEETME.TECH CANLI FİYAT GÜNCELLEME MOTORU  🛡️
echo ====================================================
echo.
echo Lütfen yapmak istediğiniz işlemi seçin:
echo   [1] Popüler ve 2026 Modeller (50 Ürün - ~1.5 Dakika) [ÖNERİLEN]
echo   [2] Bütün Akıllı Telefon Kataloğu (823 Ürün - ~25 Dakika)
echo.
set /p SECIM="Seçiminiz (1 veya 2, varsayılan 1): "

if "%SECIM%"=="2" (
    echo.
    echo 823 telefonun tamamı taranıyor ve güncelleniyor...
    node scripts/nightlyPriceSync.js --all --push
) else (
    echo.
    echo En popüler 50 telefon taranıyor ve güncelleniyor...
    node scripts/nightlyPriceSync.js --limit=50 --push
)

echo.
echo ====================================================
echo İşlem tamamlandı. Çıkmak için herhangi bir tuşa basın.
echo ====================================================
pause > nul
