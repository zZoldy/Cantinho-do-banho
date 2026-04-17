package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.EstoqueDAO;
import com.app.cantinho_banho.dao.ProdutoDAO;
import com.app.cantinho_banho.model.Estoque;
import com.app.cantinho_banho.model.Produto;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/produto/excluir")
public class ExcluirProdutoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        
        try {
            String idStr = request.getParameter("id");
            if (idStr == null || idStr.trim().isEmpty()) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "ID do produto não fornecido.");
                return;
            }
            
            Long idProduto = Long.parseLong(idStr);

            EstoqueDAO estoqueDAO = new EstoqueDAO();
            ProdutoDAO produtoDAO = new ProdutoDAO();

            Estoque estoque = estoqueDAO.buscarPorProdutoId(idProduto);
            if (estoque != null) {
                estoqueDAO.excluir(estoque);
            }

            Produto produto = produtoDAO.buscarPorId(idProduto);
            if (produto != null) {
                produtoDAO.excluir(produto);
                
                // 5. Retorna sucesso para o Front-end
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("Produto excluído com sucesso.");
                
                // 6. Avisa os outros computadores para atualizarem as suas telas em tempo real
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosProduto();
                
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "Produto não encontrado na base de dados.");
            }

        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Formato de ID inválido.");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro ao excluir o produto: " + e.getMessage());
            e.printStackTrace();
        }
    }
}