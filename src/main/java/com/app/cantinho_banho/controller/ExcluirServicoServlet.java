package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ServicoDAO;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/servicos/excluir")
public class ExcluirServicoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            Long id = Long.parseLong(request.getParameter("id"));

            ServicoDAO dao = new ServicoDAO();
            dao.excluir(id);

            response.setStatus(HttpServletResponse.SC_OK);

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosServico();

        } catch (NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
