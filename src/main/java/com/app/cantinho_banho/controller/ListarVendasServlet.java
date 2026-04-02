package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.VendaPacoteDAO;
import com.app.cantinho_banho.model.VendaPacote;
import java.io.IOException;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/pacotes/vendas/listar")
public class ListarVendasServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            VendaPacoteDAO dao = new VendaPacoteDAO();
            List<VendaPacote> vendas = dao.listarTodas();

            StringBuilder json = new StringBuilder();
            json.append("[");

            for (int i = 0; i < vendas.size(); i++) {
                VendaPacote v = vendas.get(i);
                json.append("{");
                json.append("\"id\":").append(v.getId()).append(",");
                json.append("\"clienteNome\":\"").append(v.getCliente().getNome()).append("\",");
                json.append("\"pacoteNome\":\"").append(v.getPacote().getNome()).append("\",");
                json.append("\"valorPago\":").append(v.getValorPago()).append(",");
                json.append("\"formaPagamento\":\"").append(v.getFormaPagamento()).append("\",");
                json.append("\"dataVenda\":\"").append(v.getDataVenda().toString()).append("\",");
                json.append("\"sessoesRestantes\":").append(v.getSessoesRestantes());
                json.append("}");

                if (i < vendas.size() - 1) {
                    json.append(",");
                }
            }

            json.append("]");
            response.getWriter().write(json.toString());

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"erro\": \"Erro ao processar lista de vendas\"}");
        }
    }
}