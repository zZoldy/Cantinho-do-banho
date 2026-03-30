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

@WebServlet("/api/login/reset-senha")
public class ResetSenhaServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String idStr = request.getParameter("id");
            String novaSenha = request.getParameter("novaSenha");

            if (idStr == null || idStr.trim().isEmpty() || novaSenha == null || novaSenha.trim().isEmpty()) {
                response.setStatus(400); // Bad Request
                response.getWriter().write("{\"erro\": \"Dados incompletos para a troca de senha.\"}");
                return;
            }

            Long id = Long.parseLong(idStr);
            UsuarioDAO dao = new UsuarioDAO();
            Usuario usuario = dao.buscarPorId(id);

            if (usuario == null) {
                response.setStatus(404);
                response.getWriter().write("{\"erro\": \"Usuário não encontrado.\"}");
                return;
            }

            if (!usuario.isReset_password()) {
                response.setStatus(403); // Forbidden
                response.getWriter().write("{\"erro\": \"Este usuário não requer troca de senha.\"}");
                return;
            }

            String senhaCriptografada = BCrypt.hashpw(novaSenha, BCrypt.gensalt());
            usuario.setSenha(senhaCriptografada);
            
            usuario.setReset_password(false);
            
            dao.atualizar(usuario);

            HttpSession session = request.getSession();
            session.setAttribute("usuarioLogadoId", usuario.getId());
            session.setAttribute("usuarioLogadoNome", usuario.getNome());
            session.setAttribute("usuarioLogadoPerfil", usuario.getPerfil());
            session.setMaxInactiveInterval(1800); // 30 minutos de sessão

            response.setStatus(200);
            String jsonResposta = String.format(
                "{\"mensagem\": \"Senha atualizada com sucesso!\", \"nome\": \"%s\", \"perfil\": \"%s\"}",
                usuario.getNome(), usuario.getPerfil()
            );
            response.getWriter().write(jsonResposta);

        } catch (Exception e) {
            response.setStatus(500);
            response.getWriter().write("{\"erro\": \"Erro interno ao trocar a senha.\"}");
            e.printStackTrace();
        }
    }
}