package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.FornecedorDAO;
import com.app.cantinho_banho.model.Fornecedor;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/fornecedor/cadastrar")
public class CadastrarFornecedorServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        try {
            Fornecedor fornecedor = new Fornecedor();

            fornecedor.setRazaoSocial(request.getParameter("nome"));

            String cnpj = request.getParameter("cnpj");
            fornecedor.setCnpj(cnpj != null && !cnpj.isEmpty() ? cnpj : "Não Informado");

            String telefone = request.getParameter("telefone");
            fornecedor.setTelefone(telefone != null && !telefone.isEmpty() ? telefone : "Não Informado");

            String endereco = request.getParameter("endereco");
            fornecedor.setEndereco(endereco != null && !endereco.isEmpty() ? endereco : "Não Informado");

            fornecedor.setEmail(request.getParameter("email"));
            fornecedor.setAtivo(true);

            FornecedorDAO dao = new FornecedorDAO();
            dao.salvar(fornecedor);

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("Fornecedor cadastrado com sucesso!");

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosFornecedor();

        } catch (IOException e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro ao cadastrar fornecedor: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
