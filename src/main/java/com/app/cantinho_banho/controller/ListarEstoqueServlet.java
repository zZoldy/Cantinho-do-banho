package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.EstoqueDAO;
import com.app.cantinho_banho.model.Estoque;
import com.app.cantinho_banho.model.Produto;
import com.app.cantinho_banho.model.Fornecedor;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;

@WebServlet("/api/estoque/listar")
public class ListarEstoqueServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        response.setContentType("application/json;charset=UTF-8");

        try {
            EstoqueDAO dao = new EstoqueDAO();
            List<Estoque> lista = dao.listarTodosEstoque();

            StringBuilder json = new StringBuilder();
            json.append("[");

            for (int i = 0; i < lista.size(); i++) {
                Estoque e = lista.get(i);
                Produto p = e.getProduto();
                
                json.append("{");
                json.append("\"quantidadeAtual\":").append(e.getQuantidadeAtual()).append(",");
                json.append("\"quantidadeMinima\":").append(e.getQuantidadeMinima()).append(",");
                
                // Objeto Produto
                json.append("\"produto\":{");
                json.append("\"id\":").append(p.getId()).append(",");
                
                String nomeProduto = p.getNome() != null ? p.getNome().replace("\"", "\\\"") : "";
                json.append("\"nome\":\"").append(nomeProduto).append("\",");
                
                // Usando o seu método getPreco_vendas()
                Double preco = p.getPreco_vendas() != null ? p.getPreco_vendas() : 0.0;
                json.append("\"precoVenda\":").append(preco).append(",");
                
                // Objeto Fornecedor
                Fornecedor f = p.getFornecedor();
                if (f != null) {
                    String nomeFornecedor = f.getRazaoSocial() != null ? f.getRazaoSocial().replace("\"", "\\\"") : "";
                    json.append("\"fornecedor\":{");
                    json.append("\"nome\":\"").append(nomeFornecedor).append("\"");
                    json.append("}");
                } else {
                    json.append("\"fornecedor\":null");
                }
                
                json.append("}");
                json.append("}"); 

                if (i < lista.size() - 1) {
                    json.append(",");
                }
            }
            json.append("]");

            response.getWriter().write(json.toString());
            
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("[]");
            e.printStackTrace();
        }
    }
}