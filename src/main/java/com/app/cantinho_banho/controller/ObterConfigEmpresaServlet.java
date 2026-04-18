package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ConfigEmpresaDAO;
import com.app.cantinho_banho.model.ConfigEmpresa;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/config/empresa/obter")
public class ObterConfigEmpresaServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            ConfigEmpresaDAO dao = new ConfigEmpresaDAO();
            ConfigEmpresa config = dao.obterConfiguracao();

            if (config == null) {
                response.getWriter().write("{}");
                return;
            }

            StringBuilder json = new StringBuilder();
            json.append("{");
            json.append("\"id\":").append(config.getId()).append(",");
            json.append("\"razaoSocial\":\"").append(escapeJson(config.getRazaoSocial())).append("\",");
            json.append("\"nomeFantasia\":\"").append(escapeJson(config.getNomeFantasia())).append("\",");
            json.append("\"cnpj\":\"").append(escapeJson(config.getCnpj())).append("\",");
            json.append("\"inscricaoEstadual\":\"").append(escapeJson(config.getInscricaoEstadual())).append("\",");
            json.append("\"inscricaoMunicipal\":\"").append(escapeJson(config.getInscricaoMunicipal())).append("\",");
            json.append("\"certificadoSenha\":\"").append(escapeJson(config.getCertificadoSenha())).append("\",");
            json.append("\"ambiente\":").append(config.getAmbiente() != null ? config.getAmbiente() : 2);
            json.append("}");

            response.getWriter().write(json.toString());
            
        } catch (Exception e) {
            response.setStatus(500);
            response.getWriter().write("{\"erro\": \"Erro ao buscar configuracoes: " + escapeJson(e.getMessage()) + "\"}");
        }
    }

    private String escapeJson(String texto) {
        if (texto == null) return "";
        return texto.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "");
    }
}