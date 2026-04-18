package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.DespesaDAO;
import com.app.cantinho_banho.model.Despesa;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/despesas/listar")
public class ListarDespesasServlet extends HttpServlet {
    
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();
        
        try {
            List<Despesa> despesas = new DespesaDAO().listarTodas();
            StringBuilder json = new StringBuilder();
            
            json.append("[");
            
            for (int i = 0; i < despesas.size(); i++) {
                Despesa d = despesas.get(i);
                
                String descricao = d.getDescricao() != null ? d.getDescricao().replace("\"", "\\\"") : "";
                String fornecedor = d.getFornecedor() != null ? d.getFornecedor().replace("\"", "\\\"") : "";
                String formaPag = d.getFormaPagamento() != null ? d.getFormaPagamento() : "";
                String status = d.getStatus() != null ? d.getStatus() : "";
                String dataCriacao = d.getDataCriacao() != null ? d.getDataCriacao().toString() : "";
                String tipoMov = d.getTipoMovimentacao() != null ? d.getTipoMovimentacao() : "DESPESA";

                json.append("{");
                json.append("\"id\":").append(d.getId()).append(",");
                json.append("\"descricao\":\"").append(descricao).append("\",");
                json.append("\"valor\":").append(d.getValor()).append(",");
                json.append("\"formaPagamento\":\"").append(formaPag).append("\",");
                json.append("\"status\":\"").append(status).append("\",");
                json.append("\"dataCriacao\":\"").append(dataCriacao).append("\",");
                json.append("\"fornecedor\":\"").append(fornecedor).append("\",");
                json.append("\"tipoMovimentacao\":\"").append(tipoMov).append("\"");
                json.append("}");
                if (i < despesas.size() - 1) {
                    json.append(",");
                }
            }
            
            json.append("]");
            out.print(json.toString());
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("[]");
            e.printStackTrace();
        } finally {
            out.flush();
        }
    }
}