package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.PacoteDAO;
import com.app.cantinho_banho.model.Pacote;
import java.io.IOException;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/pacotes/listar")
public class ListarPacotesServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            PacoteDAO dao = new PacoteDAO();
            List<Pacote> pacotes = dao.listarTodos();

            StringBuilder json = new StringBuilder();
            json.append("[");
            
            for (int i = 0; i < pacotes.size(); i++) {
                Pacote p = pacotes.get(i);
                
                String nomeSeguro = p.getNome() != null ? p.getNome().replace("\"", "\\\"") : "";

                json.append("{")
                    .append("\"id\":").append(p.getId()).append(",")
                    .append("\"nome\":\"").append(nomeSeguro).append("\",")
                    .append("\"sessoes\":").append(p.getQuantidadeSessoes()).append(",")
                    .append("\"validade\":").append(p.getValidadeDias()).append(",")
                    .append("\"valor\":").append(p.getValor())
                    .append("}");
                
                if (i < pacotes.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write(json.toString());

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("[]");
        }
    }
}