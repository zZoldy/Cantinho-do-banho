package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.HorarioFuncionamentoDAO;
import com.app.cantinho_banho.model.HorarioFuncionamento;
import java.io.IOException;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/horarios/listar")
public class ListarHorariosServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            HorarioFuncionamentoDAO dao = new HorarioFuncionamentoDAO();
            List<HorarioFuncionamento> horarios = dao.listarTodos();

            StringBuilder json = new StringBuilder();
            json.append("[");
            
            for (int i = 0; i < horarios.size(); i++) {
                HorarioFuncionamento h = horarios.get(i);
                json.append("{");
                json.append("\"id\":").append(h.getId()).append(",");
                json.append("\"diaDaSemana\":").append(h.getDiaDaSemana()).append(",");
                json.append("\"nomeDia\":\"").append(h.getNomeDia()).append("\",");
                json.append("\"aberto\":").append(h.isAberto()).append(",");
                json.append("\"horaAbertura\":\"").append(h.getHoraAbertura()).append("\",");
                json.append("\"horaFechamento\":\"").append(h.getHoraFechamento()).append("\"");
                json.append("}");
                
                if (i < horarios.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(json.toString());
            
        } catch (IOException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("[]");
        }
    }
}