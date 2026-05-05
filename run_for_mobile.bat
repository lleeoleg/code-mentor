@echo off
REM Запуск backend так, чтобы мобильное приложение (телефон в той же Wi-Fi) могло подключиться.
REM Узнайте IP ПК: ipconfig, затем в myApp/.env укажите EXPO_PUBLIC_API_URL=http://ВАШ_IP:8000/api
python manage.py runserver 0.0.0.0:8000
