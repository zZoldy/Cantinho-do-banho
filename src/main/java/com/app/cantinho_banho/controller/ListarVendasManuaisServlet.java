package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.VendaDAO;
import com.app.cantinho_banho.model.Venda;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/vendas-manuais/listar")
public class ListarVendasManuaisServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        try {
            VendaDAO vendaDAO = new VendaDAO();
            List<Venda> vendas = vendaDAO.listarTodas();

            StringBuilder json = new StringBuilder();
            json.append("[");

            for (int i = 0; i < vendas.size(); i++) {
                Venda v = vendas.get(i);
                
                String cliente = v.getClienteNome() != null ? v.getClienteNome().replace("\"", "\\\"") : "Consumidor Final";
                String data = v.getDataVenda() != null ? v.getDataVenda().toString() : "";
                Double valor = v.getValorTotal() != null ? v.getValorTotal() : 0.0;
                
                String formaPag = v.getFormaPagamento() != null ? v.getFormaPagamento() : "Não informada";

                String nomeProduto = v.getProduto() != null ? v.getProduto().getNome().replace("\"", "\\\"") : "Produto Excluído";
                String descricaoPersonalizada = v.getQuantidade() + "x " + nomeProduto;

                json.append("{")
                        .append("\"id\": ").append(v.getId()).append(", ")
                        .append("\"descricao\": \"").append(descricaoPersonalizada).append("\", ")
                        .append("\"cliente\": \"").append(cliente).append("\", ")
                        .append("\"valor\": ").append(valor).append(", ")
                        .append("\"formaPagamento\": \"").append(formaPag).append("\", ")
                        .append("\"data\": \"").append(data).append("\", ")
                        .append("\"nfEmitida\": ").append(v.isNfEmitida())
                        .append("}");

                if (i < vendas.size() - 1) {
                    json.append(", ");
                }
            }
            json.append("]");

            out.print(json.toString());

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("[]");
        } finally {
            out.flush();
        }
    }
}