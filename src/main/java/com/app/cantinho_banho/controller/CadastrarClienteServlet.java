package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.dao.UsuarioDAO;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Usuario;
import org.mindrot.jbcrypt.BCrypt;
import java.io.IOException;
import java.util.UUID;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/clientes/cadastrar")
public class CadastrarClienteServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            String nome = request.getParameter("nome");
            String telefone = request.getParameter("telefone");
            String email = request.getParameter("email");
            String cpf = request.getParameter("cpf");

            ClienteDAO clienteDAO = new ClienteDAO();
            Usuario usuario = new Usuario();

            Cliente cliente = clienteDAO.buscarPorTelefoneENome(telefone, nome);
            if (cliente == null) {
                if (clienteDAO.existeTelefone(telefone)) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Este Telefone já está em uso por outra pessoa.");
                    return;
                }
                cliente = new Cliente();
                cliente.setNome(nome);
                cliente.setTelefone(telefone);
            }
            
            String senhaGerada = null;

            if (email != null && !email.trim().isEmpty() && cpf != null && !cpf.trim().isEmpty()) {
                UsuarioDAO usuarioDAO = new UsuarioDAO();

                if (usuarioDAO.existeEmail(email)) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Este e-mail já está em uso por outra pessoa.");
                    return;
                }

                if (usuarioDAO.existeCpf(cpf)) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Este cpf já está em uso por outra pessoa.");
                    return;
                }

                senhaGerada = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
                String senhaCriptografada = BCrypt.hashpw(senhaGerada, BCrypt.gensalt());

                usuario.setNome(nome);
                usuario.setEmail(email);
                usuario.setCpf(cpf);
                usuario.setSenha(senhaCriptografada);
                usuario.setPerfil("Cliente");
                usuario.setAtivo(true);
                usuario.setReset_password(true);
                cliente.setUsuario(usuario);
            }

            clienteDAO.salvar(cliente);
            
            String json = String.format("{\"senha\": \"%s\", \"telefone\": \"%s\", \"status\": \"sucesso\"}",
                    senhaGerada != null ? senhaGerada : "",
                    cliente.getTelefone() != null ? cliente.getTelefone() : "");
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(json);

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosCadCliente();
        } catch (IOException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro no servidor: " + e.getMessage());
        }
    }
}
