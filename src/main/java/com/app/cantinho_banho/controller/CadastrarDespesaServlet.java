package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.DespesaDAO;
import com.app.cantinho_banho.model.Despesa;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;

@WebServlet("/api/despesas/cadastrar")
public class CadastrarDespesaServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");

        try {
            Despesa d = new Despesa();
            d.setDescricao(request.getParameter("descricao"));
            d.setValor(Double.parseDouble(request.getParameter("valor")));
            d.setFornecedor(request.getParameter("fornecedor"));
            d.setFormaPagamento(request.getParameter("formaPagamento"));
            d.setStatus(request.getParameter("status"));
            d.setDataCriacao(LocalDateTime.now());
            d.setTipoMovimentacao("DESPESA");

            new DespesaDAO().salvar(d);

            response.setStatus(HttpServletResponse.SC_CREATED);

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosDespesa();
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
