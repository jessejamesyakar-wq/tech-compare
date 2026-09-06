@echo off
chcp 65001 > nul
title Aceleetme.tech Evrensel Fiyat Güncelleme Motoru
echo ===================================================================
echo 🛡️  ACELEETME.TECH EVRENSEL FİYAT GÜNCELLEME MOTORU (9 KATEGORİ)  🛡️
echo ===================================================================
echo.
echo Lütfen güncellemek istediğiniz operasyonu seçin:
echo.
echo   [1] Tüm Kategoriler - Popüler Ürünler (~25 Ürün/Kategori - ~6 Dakika) [ÖNERİLEN]
echo   [2] Sadece Akıllı Telefonlar (823 Ürün - ~25 Dakika)
echo   [3] Sadece Televizyonlar (938 Ürün - ~28 Dakika)
echo   [4] Sadece Laptop / Bilgisayarlar (831 Ürün - ~25 Dakika)
echo   [5] Sadece Kulaklıklar (823 Ürün - ~25 Dakika)
echo   [6] Sadece Akıllı Saatler (136 Ürün - ~4 Dakika)
echo   [7] Sadece Beyaz Eşya ve Küçük Ev Aletleri (956 Ürün - ~30 Dakika)
echo   [8] Sadece Monitörler (634 Ürün - ~20 Dakika)
echo   [9] Sadece Tabletler (557 Ürün - ~18 Dakika)
echo   [10] Sadece Oyun Konsolları (70 Ürün - ~2 Dakika)
echo   [11] BÜTÜN 9 KATEGORİNİN TAMAMI (5.768 Ürün - Kapsamlı Tarama ~3 Saat)
echo.
set /p SECIM="Seçiminiz (1-11, varsayılan 1): "

if "%SECIM%"=="2" (
    echo.
    echo 823 telefonun tamamı taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --category=smartphones --all --push
) else if "%SECIM%"=="3" (
    echo.
    echo 938 televizyonun tamamı taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --category=tvs --all --push
) else if "%SECIM%"=="4" (
    echo.
    echo 831 laptopun tamamı taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --category=laptops --all --push
) else if "%SECIM%"=="5" (
    echo.
    echo 823 kulaklığın tamamı taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --category=headphones --all --push
) else if "%SECIM%"=="6" (
    echo.
    echo 136 akıllı saatin tamamı taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --category=smartwatches --all --push
) else if "%SECIM%"=="7" (
    echo.
    echo 956 ev aletinin tamamı taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --category=appliances --all --push
) else if "%SECIM%"=="8" (
    echo.
    echo 634 monitörün tamamı taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --category=monitors --all --push
) else if "%SECIM%"=="9" (
    echo.
    echo 557 tabletin tamamı taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --category=tablets --all --push
) else if "%SECIM%"=="10" (
    echo.
    echo 70 oyun konsolunun tamamı taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --category=consoles --all --push
) else if "%SECIM%"=="11" (
    echo.
    echo BÜTÜN 9 KATEGORİ (5.768 Ürün) taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --all --push
) else (
    echo.
    echo Tüm kategorilerdeki popüler ürünler taranmaya başlanıyor...
    node scripts/syncAllCatalogs.js --limit=25 --push
)

echo.
echo ===================================================================
echo İşlem tamamlandı. Çıkmak için herhangi bir tuşa basın.
echo ===================================================================
pause > nul
