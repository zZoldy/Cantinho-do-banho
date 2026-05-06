package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.VendaDAO;
import com.app.cantinho_banho.model.Produto;
import com.app.cantinho_banho.model.Venda;

import java.io.BufferedReader;
import java.io.IOException;
import java.time.LocalDateTime;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/vendas")
public class CadastrarVendaServlet extends HttpServlet {

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

            String produtoIdStr = extrairValorJSON(jsonPayload, "\"id\":");
            String qtdStr = extrairValorJSON(jsonPayload, "\"quantidade\":");
            String valorTotalStr = extrairValorJSON(jsonPayload, "\"valorTotal\":");
            String clienteNome = extrairValorJSON(jsonPayload, "\"clienteNome\":");
            String formaPag = extrairValorJSON(jsonPayload, "\"formaPagamento\":");

            Venda novaVenda = new Venda();

            if (produtoIdStr != null && !produtoIdStr.isEmpty()) {
                Produto produto = new Produto();
                produto.setId(Long.parseLong(produtoIdStr));
                novaVenda.setProduto(produto);
            }

            novaVenda.setQuantidade(qtdStr != null ? Integer.parseInt(qtdStr) : 1);
            novaVenda.setValorTotal(valorTotalStr != null ? Double.parseDouble(valorTotalStr) : 0.0);
            novaVenda.setClienteNome(clienteNome);
            novaVenda.setFormaPagamento(formaPag);
            novaVenda.setDataVenda(LocalDateTime.now());

            VendaDAO vendaDAO = new VendaDAO();
            vendaDAO.salvar(novaVenda);

            response.setStatus(HttpServletResponse.SC_CREATED);

            StringBuilder jsonResponse = new StringBuilder();
            jsonResponse.append("{")
                    .append("\"status\": \"sucesso\", ")
                    .append("\"mensagem\": \"Venda registrada com sucesso!\"")
                    .append("}");

            response.getWriter().write(jsonResponse.toString());

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosServico();

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);

            StringBuilder erroResponse = new StringBuilder();
            erroResponse.append("{")
                    .append("\"erro\": \"Erro ao processar a venda: ")
                    .append(e.getMessage() != null ? e.getMessage().replace("\"", "'") : "Erro desconhecido")
                    .append("\"")
                    .append("}");

            response.getWriter().write(erroResponse.toString());
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
