package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.FornecedorDAO;
import com.app.cantinho_banho.model.Endereco;
import com.app.cantinho_banho.model.Fornecedor;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/fornecedor/atualizar")
public class AtualizarFornecedorServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            FornecedorDAO dao = new FornecedorDAO();
            Fornecedor fornecedor = dao.buscarPorId(id); // Busca o original

            if (fornecedor != null) {
                fornecedor.setRazaoSocial(request.getParameter("nome"));
                fornecedor.setCnpj(request.getParameter("cnpj"));
                fornecedor.setTelefone(request.getParameter("telefone"));
                fornecedor.setEmail(request.getParameter("email"));

                Endereco endereco = fornecedor.getEndereco();
                if (endereco == null) {
                    endereco = new Endereco();
                }

                endereco.setCep(request.getParameter("cep"));
                endereco.setLogradouro(request.getParameter("logradouro"));
                endereco.setNumero(request.getParameter("numero"));
                endereco.setBairro(request.getParameter("bairro"));
                endereco.setCidade(request.getParameter("cidade"));
                endereco.setUf(request.getParameter("uf"));
                endereco.setComplemento(request.getParameter("complemento"));

                fornecedor.setEndereco(endereco);
                dao.atualizar(fornecedor);
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("Fornecedor atualizado com sucesso!");
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosFornecedor();
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Fornecedor não encontrado.");
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro: " + e.getMessage());
        }
    }
}
