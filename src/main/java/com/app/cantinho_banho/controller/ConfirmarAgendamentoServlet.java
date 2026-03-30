package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.AgendamentoDAO;
import com.app.cantinho_banho.model.Agendamento;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalTime;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/agendamentos/confirmar")
public class ConfirmarAgendamentoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            String novaData = request.getParameter("data");
            String novaHora = request.getParameter("hora");
            String novoStatus = request.getParameter("status");

            AgendamentoDAO dao = new AgendamentoDAO();
            
            Agendamento agendamento = dao.buscarPorId(id);

            if (agendamento != null) {
                agendamento.setStatus(novoStatus);
                
                if (novaData != null && !novaData.isEmpty()) {
                    agendamento.setData(LocalDate.parse(novaData));
                }
                if (novaHora != null && !novaHora.isEmpty()) {
                    agendamento.setHora(LocalTime.parse(novaHora));
                }

                dao.salvarOuAtualizar(agendamento);
                
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodos();

                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"mensagem\": \"Agendamento confirmado com sucesso!\"}");
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"erro\": \"Agendamento não encontrado.\"}");
            }

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"erro\": \"Erro ao processar: " + e.getMessage() + "\"}");
        }
    }
}