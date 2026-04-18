package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ServicoDAO;
import com.app.cantinho_banho.model.Servico;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/servicos/atualizar")
public class AtualizarServicoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            String nome = request.getParameter("nome");
            String tempoStr = request.getParameter("tempo");

            ServicoDAO dao = new ServicoDAO();
            Servico s = dao.buscarPorId(id);

            if (s != null) {
                s.setNome(nome);
                s.setTempoAtendimento(Integer.parseInt(tempoStr));
                dao.atualizar(s);
                response.setStatus(HttpServletResponse.SC_OK);

                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosServico();
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
