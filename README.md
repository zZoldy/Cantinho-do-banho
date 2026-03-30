# 🐾 Cantinho do Banho - Sistema de Gestão de Pet Shop

Sistema Web para gerenciamento de agendamentos e equipe de um Pet Shop, desenvolvido com foco em segurança, rastreabilidade e facilidade de uso.

## 🚀 Funcionalidades Atuais
- **Agendamentos:** Cadastro completo de banho e tosa integrado ao MySQL.
- **Gestão de Usuários:** Cadastro de funcionários e administradores.
- **Segurança:** Senhas criptografadas com **BCrypt** (Hash).
- **Matrícula Automática:** Geração de identificador único (Ex: `CDB-123456`).
- **Soft Delete:** Controle de usuários ativos/inativos para preservação de histórico.

## 🛠️ Tecnologias Utilizadas
- **Backend:** Java 17, Servlets, JPA (Hibernate).
- **Banco de Dados:** MySQL 8.0.
- **Frontend:** HTML5, CSS3 (Modern UI), JavaScript (Vanila/Fetch API).
- **Segurança:** jBCrypt.
- **Gerenciador de Dependências:** Maven.

## 📋 Pré-requisitos
Antes de começar, você vai precisar ter instalado:
- [JDK 11 ou superior](https://www.oracle.com/java/technologies/downloads/)
- [Apache Tomcat 9.0+](https://tomcat.apache.org/)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)
- IDE (NetBeans, IntelliJ ou Eclipse)

## 🔧 Como Rodar o Projeto

1. **Configurar o Banco de Dados:**
   - Crie o schema no MySQL: `CREATE DATABASE cantinho_banho;`
   - O Hibernate criará as tabelas automaticamente no primeiro acesso.

2. **Ajustar Credenciais:**
   - Abra o arquivo `src/main/resources/META-INF/persistence.xml`.
   - Altere o `javax.persistence.jdbc.user` e `password` para os seus dados do MySQL.

3. **Compilar e Rodar:**
   - No NetBeans, clique com o botão direito no projeto e selecione **Clean and Build**.
   - Clique em **Run** (Play). O projeto será implantado no Tomcat.
   - Acesse no navegador: `http://localhost:8080/Cantinho_banho-1.0-SNAPSHOT/`

## 🛡️ Segurança de Dados
Este projeto não armazena senhas em texto plano. Todas as credenciais passam por um processo de Hashing antes de persistirem no banco de dados, garantindo conformidade com boas práticas de segurança.

---
Desenvolvido por [Backend: Filipe Alves Santos | Frontend: Katlheen Dias] - 2026
