@echo off
rem 正在搜索...
for /f "delims=" %%i in ('dir /b /a-d /s "*.js"') do (
	echo %%i
	java -jar compiler.jar --js %%i --js_output_file ../%%~nxi
)
rem 搜索完毕
pause