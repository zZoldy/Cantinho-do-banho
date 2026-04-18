package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.DespesaDAO;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/despesas/excluir")
public class ExcluirDespesaServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            new DespesaDAO().excluir(id);
            response.setStatus(HttpServletResponse.SC_OK);

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosDespesa();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
