package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.DespesaDAO;
import com.app.cantinho_banho.model.Despesa;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/despesas/baixar")
public class BaixarDespesaServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            DespesaDAO dao = new DespesaDAO();
            Despesa despesa = dao.buscarPorId(id);

            if (despesa != null) {
                despesa.setStatus("PAGO");
                dao.atualizar(despesa);
                response.setStatus(HttpServletResponse.SC_OK);
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosDespesa();
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
