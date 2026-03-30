package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ServicoDAO;
import com.app.cantinho_banho.model.Servico;
import java.io.IOException;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/servicos/listar")
public class ListarServicosServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            ServicoDAO dao = new ServicoDAO();
            List<Servico> servicos = dao.listarTodos();

            StringBuilder json = new StringBuilder();
            json.append("[");
            
            for (int i = 0; i < servicos.size(); i++) {
                Servico s = servicos.get(i);
                json.append("{");
                json.append("\"id\":").append(s.getId()).append(",");
                json.append("\"nome\":\"").append(s.getNome().replace("\"", "\\\"")).append("\",");
                json.append("\"tempo\":").append(s.getTempoAtendimento());
                json.append("}");
                
                if (i < servicos.size() - 1) {
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