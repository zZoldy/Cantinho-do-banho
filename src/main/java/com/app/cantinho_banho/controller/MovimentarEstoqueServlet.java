package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.EstoqueDAO;
import com.app.cantinho_banho.model.Estoque;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;

@WebServlet("/api/estoque/movimentar")
public class MovimentarEstoqueServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        try {
            StringBuilder sb = new StringBuilder();
            BufferedReader reader = request.getReader();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            String jsonPayload = sb.toString();

            String produtoIdStr = extrairValorJSON(jsonPayload, "\"produtoId\":");
            String tipoStr = extrairValorJSON(jsonPayload, "\"tipoMovimento\":"); 
            String qtdStr = extrairValorJSON(jsonPayload, "\"quantidade\":");

           if (produtoIdStr == null && request.getParameter("produtoId") != null) {
                produtoIdStr = request.getParameter("produtoId");
                tipoStr = request.getParameter("tipo");
                qtdStr = request.getParameter("quantidade");
            }

            Long produtoId = Long.parseLong(produtoIdStr);
            String tipo = tipoStr;
            Integer quantidade = Integer.parseInt(qtdStr);

            EstoqueDAO estoqueDAO = new EstoqueDAO();
            Estoque estoque = estoqueDAO.buscarPorProdutoId(produtoId);

            if (estoque == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"erro\": \"Estoque não encontrado para este produto.\"}");
                return;
            }

            if ("SAIDA".equalsIgnoreCase(tipo)) {
                if (estoque.getQuantidadeAtual() < quantidade) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("{\"erro\": \"Estoque insuficiente! Existem apenas " + estoque.getQuantidadeAtual() + " unidades.\"}");
                    return;
                }
                estoque.setQuantidadeAtual(estoque.getQuantidadeAtual() - quantidade);
                
            } else if ("ENTRADA".equalsIgnoreCase(tipo)) {
                estoque.setQuantidadeAtual(estoque.getQuantidadeAtual() + quantidade);
                
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"erro\": \"Tipo de movimentação inválida.\"}");
                return;
            }

            estoqueDAO.salvar(estoque); 
            
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"status\": \"sucesso\"}");
            
            try {
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosProduto();
            } catch (Exception ignored) { }

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"erro\": \"Erro interno: " + e.getMessage() + "\"}");
        }
    }

    private String extrairValorJSON(String json, String chave) {
        int inicioChave = json.indexOf(chave);
        if (inicioChave == -1) {
            return null;
        }

        int inicioValor = inicioChave + chave.length();
        int fimValor = json.indexOf(",", inicioValor);

        if (fimValor == -1) {
            fimValor = json.indexOf("}", inicioValor);
        }
        if (fimValor == -1) {
            return null;
        }

        String valor = json.substring(inicioValor, fimValor).trim();
        valor = valor.replace("\"", "").replace("{", "").replace("}", "").trim();

        if (valor.equalsIgnoreCase("null")) {
            return null;
        }

        return valor;
    }
}