package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.EstoqueDAO;
import com.app.cantinho_banho.dao.FornecedorDAO;
import com.app.cantinho_banho.dao.ProdutoDAO;
import com.app.cantinho_banho.model.Estoque;
import com.app.cantinho_banho.model.Fornecedor;
import com.app.cantinho_banho.model.Produto;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;

@WebServlet("/api/produto/cadastrar")
public class CadastrarProdutoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        try {
            String nome = request.getParameter("nome");
            String precoVendasStr = request.getParameter("precoVenda");
            String fornecedorIdStr = request.getParameter("fornecedorId");
            String qtdInicialStr = request.getParameter("qtdInicial");
            String qtdMinimaStr = request.getParameter("qtdMinima");

            Produto produto = new Produto();
            produto.setNome(nome);

            produto.setCodigo_barras("SEM_CODIGO");

            produto.setPreco_vendas(precoVendasStr != null && !precoVendasStr.isEmpty() ? Double.parseDouble(precoVendasStr) : 0.0);

            if (fornecedorIdStr != null && !fornecedorIdStr.isEmpty()) {
                FornecedorDAO fornecedorDAO = new FornecedorDAO();
                Fornecedor fornecedor = fornecedorDAO.buscarPorId(Long.parseLong(fornecedorIdStr));
                produto.setFornecedor(fornecedor);
            }

            ProdutoDAO produtoDAO = new ProdutoDAO();
            produtoDAO.salvar(produto);

            Estoque estoque = new Estoque();
            estoque.setProduto(produto);
            estoque.setQuantidadeAtual(qtdInicialStr != null && !qtdInicialStr.isEmpty() ? Integer.parseInt(qtdInicialStr) : 0);

            estoque.setQuantidadeMinima(qtdMinimaStr != null && !qtdMinimaStr.isEmpty() ? Integer.parseInt(qtdMinimaStr) : 5);
            estoque.setDataUltimaReposicao(LocalDateTime.now());

            EstoqueDAO estoqueDAO = new EstoqueDAO();
            estoqueDAO.salvar(estoque);

            int quantidadeEstoque = estoque.getQuantidadeAtual();
            String custoStr = request.getParameter("custoTotal");
            String formaPag = request.getParameter("formaPagamento");

            // Só gera despesa se a pessoa colocou estoque > 0 e digitou o custo (maior que zero)
            if (quantidadeEstoque > 0 && custoStr != null && !custoStr.trim().isEmpty() && !custoStr.equals("0.00")) {
                com.app.cantinho_banho.model.Despesa despesaInicial = new com.app.cantinho_banho.model.Despesa();
                despesaInicial.setDescricao("Estoque Inicial: " + quantidadeEstoque + "x " + produto.getNome());

                try {
                    despesaInicial.setValor(Double.parseDouble(custoStr)); 
                } catch (NumberFormatException ex) {
                    despesaInicial.setValor(0.0);
                }

                despesaInicial.setFormaPagamento(formaPag != null && !formaPag.isEmpty() ? formaPag : "DINHEIRO");
                despesaInicial.setStatus("PAGO");
                despesaInicial.setDataCriacao(java.time.LocalDateTime.now());
                despesaInicial.setFornecedor(produto.getFornecedor() != null ? produto.getFornecedor().getRazaoSocial(): "Fornecedor Avulso");
                despesaInicial.setTipoMovimentacao("DESPESA");

                new com.app.cantinho_banho.dao.DespesaDAO().salvar(despesaInicial);
            }

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("Produto e Estoque cadastrados com sucesso!");

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosProduto();

        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro ao cadastrar: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
