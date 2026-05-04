@echo off
SET JAVA_HOME=C:\Users\Z D K\.jdk\jdk-25.0.2
SET PATH=C:\Users\Z D K\.jdk\jdk-25.0.2\bin;C:\Users\Z D K\.maven\maven-3.9.15\bin;%PATH%
cd /d C:\Users\Z D K\OneDrive\Documentos\NetBeansProjects\Cantinho_do_banho
"C:\Users\Z D K\.maven\maven-3.9.15\bin\mvn.cmd" clean test-compile -q
