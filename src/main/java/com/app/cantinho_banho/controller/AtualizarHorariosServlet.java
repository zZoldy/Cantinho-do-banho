package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.HorarioFuncionamentoDAO;
import com.app.cantinho_banho.model.HorarioFuncionamento;
import java.io.IOException;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/horarios/atualizar")
public class AtualizarHorariosServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");

        try {
            HorarioFuncionamentoDAO dao = new HorarioFuncionamentoDAO();
            List<HorarioFuncionamento> lista = dao.listarTodos();

            // Varre os 7 dias e atualiza os valores que vieram do JavaScript
            for (HorarioFuncionamento h : lista) {
                int dia = h.getDiaDaSemana();
                String aberto = request.getParameter("dia_" + dia + "_aberto");
                String abre = request.getParameter("dia_" + dia + "_abre");
                String fecha = request.getParameter("dia_" + dia + "_fecha");

                if (aberto != null) {
                    h.setAberto(aberto.equals("true"));
                    h.setHoraAbertura(abre);
                    h.setHoraFechamento(fecha);
                    dao.atualizar(h);
                }
            }

            response.setStatus(HttpServletResponse.SC_OK);
            
            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosHorario();
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}