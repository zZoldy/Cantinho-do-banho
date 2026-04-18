package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.dao.UsuarioDAO;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Usuario;
import com.app.cantinho_banho.model.Endereco; // 🟢 Importação do novo modelo
import java.io.IOException;
import java.util.UUID;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.mindrot.jbcrypt.BCrypt;

@WebServlet("/api/clientes/criar-acesso")
public class CriarAcessoClienteServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            // 1. Captura de parâmetros básicos
            Long clienteId = Long.parseLong(request.getParameter("clienteId"));
            String email = request.getParameter("email");
            String cpf = request.getParameter("cpf");

            // 2. 🟢 Captura de parâmetros de endereço
            String cep = request.getParameter("cep");
            String logradouro = request.getParameter("logradouro");
            String numero = request.getParameter("numero");
            String bairro = request.getParameter("bairro");
            String cidade = request.getParameter("cidade");
            String uf = request.getParameter("uf");

            ClienteDAO dao = new ClienteDAO();
            Cliente cliente = dao.buscarPorId(clienteId);

            if (cliente == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"erro\": \"Cliente não encontrado.\"}");
                return;
            }

            if (cliente.getUsuario() != null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"erro\": \"Este cliente já possui um utilizador vinculado.\"}");
                return;
            }

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

            if (cep != null && !cep.trim().isEmpty()) {
                Endereco endereco = cliente.getEndereco();
                if (endereco == null) {
                    endereco = new Endereco();
                }

                endereco.setCep(cep);
                endereco.setLogradouro(logradouro);
                endereco.setNumero(numero);
                endereco.setBairro(bairro);
                endereco.setCidade(cidade);
                endereco.setUf(uf);

                cliente.setEndereco(endereco);
            }

            String senhaGerada = UUID.randomUUID().toString().substring(0, 6).toUpperCase();

            Usuario u = new Usuario();
            u.setNome(cliente.getNome());
            u.setEmail(email);
            u.setCpf(cpf);
            u.setPerfil("Cliente");
            u.setAtivo(true);
            u.setReset_password(true);
            u.setSenha(BCrypt.hashpw(senhaGerada, BCrypt.gensalt()));

            cliente.setUsuario(u);

            dao.criarAcessoEVincular(cliente, u);

            String json = String.format("{\"senha\": \"%s\", \"telefone\": \"%s\"}",
                    senhaGerada,
                    cliente.getTelefone() != null ? cliente.getTelefone() : "");

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(json);

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosCadCliente();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"erro\": \"Erro ao processar criação de acesso no servidor.\"}");
        }
    }
}
