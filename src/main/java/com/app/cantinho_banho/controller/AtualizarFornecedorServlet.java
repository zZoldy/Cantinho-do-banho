package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.FornecedorDAO;
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
                fornecedor.setEndereco(request.getParameter("endereco"));

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
