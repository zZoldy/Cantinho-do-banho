package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.FornecedorDAO;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/fornecedor/excluir")
public class ExcluirFornecedorServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            String idStr = request.getParameter("id");
            if (idStr != null && !idStr.isEmpty()) {
                Long id = Long.parseLong(idStr);
                new FornecedorDAO().excluir(id);
                response.setStatus(HttpServletResponse.SC_OK);
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosFornecedor();
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro ao excluir: Verifique se existem produtos vinculados a este fornecedor.");
        }
    }
}
