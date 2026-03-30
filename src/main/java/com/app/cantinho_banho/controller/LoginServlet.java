/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.UsuarioDAO;
import com.app.cantinho_banho.model.Usuario;
import java.io.IOException;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import org.mindrot.jbcrypt.BCrypt;

@WebServlet("/api/login")
public class LoginServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String email = request.getParameter("email");
            String senha = request.getParameter("senha");

            if (email == null || email.trim().isEmpty() || senha == null || senha.trim().isEmpty()) {
                response.setStatus(400);
                response.getWriter().write("{\"erro\": \"E-mail e senha são obrigatórios.\"}");
                return;
            }

            UsuarioDAO dao = new UsuarioDAO();
            Usuario usuario = dao.buscarPorEmail(email);

            if (usuario == null) {
                response.setStatus(401);
                response.getWriter().write("{\"erro:\": \"E-mail ou senha incorretos.\"}");
                return;
            }

            if (!BCrypt.checkpw(senha, usuario.getSenha())) {
                response.setStatus(401);
                response.getWriter().write("{\"erro:\": \"E-mail ou senha incorretos.\"}");
                return;
            }

            if (!usuario.isAtivo()) {
                response.setStatus(403);
                response.getWriter().write("{\"erro\": \"Sua conta foi bloqueada. Procure a administração.\"}");
                return;
            }

            if (usuario.isReset_password()) {
                response.setStatus(200);
                String jsonReset = String.format(
                        "{\"mensagem\": \"Troca de senha obrigatória.\", \"requireReset\": true, \"id\": %d, \"email\": \"%s\"}",
                        usuario.getId(), usuario.getEmail()
                );
                response.getWriter().write(jsonReset);
                return;
            }

            HttpSession session = request.getSession();
            session.setAttribute("usuarioLogadoId", usuario.getId());
            session.setAttribute("usuarioLogadoNome", usuario.getNome());
            session.setAttribute("usuarioLogadoPerfil", usuario.getPerfil());
            session.setMaxInactiveInterval(1800); // Sessão expira em 30 minutos de inatividade

            response.setStatus(200);
            String jsonResposta = String.format(
                    "{\"mensagem\": \"Login realizado com sucesso!\", \"requireReset\": false, \"id\": %d, \"nome\": \"%s\", \"perfil\": \"%s\"}",
                    usuario.getId(), usuario.getNome(), usuario.getPerfil()
            );
            response.getWriter().write(jsonResposta);

        } catch (Exception e) {
            response.setStatus(500);
            response.getWriter().write("{\"erro\": \"Erro interno no servidor.\"}");
            e.printStackTrace();
        }
    }
}
