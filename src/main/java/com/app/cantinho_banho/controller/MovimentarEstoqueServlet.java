package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.EstoqueDAO;
import com.app.cantinho_banho.model.Estoque;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;

@WebServlet("/api/estoque/movimentar")
public class MovimentarEstoqueServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        try {
            Long produtoId = Long.parseLong(request.getParameter("produtoId"));
            String tipo = request.getParameter("tipo"); // ENTRADA ou SAIDA
            Integer quantidade = Integer.parseInt(request.getParameter("quantidade"));

            EstoqueDAO estoqueDAO = new EstoqueDAO();
            Estoque estoque = estoqueDAO.buscarPorProdutoId(produtoId);

            if (estoque == null) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("Estoque não encontrado para este produto.");
                return;
            }

            if ("SAIDA".equalsIgnoreCase(tipo)) {
                if (estoque.getQuantidadeAtual() < quantidade) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    response.getWriter().write("Estoque insuficiente! Existem apenas " + estoque.getQuantidadeAtual() + " unidades.");
                    return;
                }
                estoque.setQuantidadeAtual(estoque.getQuantidadeAtual() - quantidade);
            } else if ("ENTRADA".equalsIgnoreCase(tipo)) {
                estoque.setQuantidadeAtual(estoque.getQuantidadeAtual() + quantidade);
                estoque.setDataUltimaReposicao(LocalDateTime.now());
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("Tipo de movimentação inválida.");
                return;
            }

            estoqueDAO.salvar(estoque); // Atualiza no banco
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("Estoque atualizado com sucesso!");

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro interno: " + e.getMessage());
            e.printStackTrace();
        }
    }
}