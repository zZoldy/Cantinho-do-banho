package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ConfigEmpresaDAO;
import com.app.cantinho_banho.model.ConfigEmpresa;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/config/limite")
public class ObterLimiteAgendamentoServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            ConfigEmpresaDAO dao = new ConfigEmpresaDAO();
            ConfigEmpresa config = dao.obterConfiguracao(); 

            int limite = (config != null && config.getLimitePorHorario() > 0) ? config.getLimitePorHorario() : 1;

            response.getWriter().write("{\"limitePorHorario\": " + limite + "}");
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"limitePorHorario\": 1}");
        }
    }
}