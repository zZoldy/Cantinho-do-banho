package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Endereco;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/clientes/atualizar")
public class AtualizarClienteServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            ClienteDAO dao = new ClienteDAO();
            Cliente c = dao.buscarPorId(id);

            if (c != null) {
                c.setNome(request.getParameter("nome"));
                c.setTelefone(request.getParameter("telefone"));

                // Lógica do Endereço
                Endereco end = c.getEndereco();
                if (end == null) {
                    end = new Endereco();
                }

                end.setCep(request.getParameter("cep"));
                end.setLogradouro(request.getParameter("logradouro"));
                end.setNumero(request.getParameter("numero"));
                end.setBairro(request.getParameter("bairro"));
                end.setCidade(request.getParameter("cidade"));
                end.setUf(request.getParameter("uf"));

                c.setEndereco(end);
                dao.salvar(c); // O CascadeType.ALL cuida do endereço
                response.setStatus(200);
            }
        } catch (Exception e) {
            response.setStatus(500);
        }
    }
}
