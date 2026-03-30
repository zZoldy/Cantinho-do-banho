package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.AgendamentoDAO;
import com.app.cantinho_banho.model.Agendamento;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/agendamentos/concluir")
public class ConcluirAgendamentoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            String novoStatus = request.getParameter("status"); // Vem "Retirada" do JS

            AgendamentoDAO dao = new AgendamentoDAO();
            Agendamento a = dao.buscarPorId(id);

            if (a != null) {
                a.setStatus(novoStatus);

                dao.salvarOuAtualizar(a);
                
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodos();
                
                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
