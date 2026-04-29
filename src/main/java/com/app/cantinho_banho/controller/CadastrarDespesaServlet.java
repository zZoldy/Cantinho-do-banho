package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.DespesaDAO;
import com.app.cantinho_banho.model.Despesa;
import com.app.cantinho_banho.resources.Function;

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
            if (Function.isInicioBarraInvertida(d.getDescricao())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("A Descrição não pode iniciar com barra invertida.");
                return;
            }
            d.setValor(Double.parseDouble(request.getParameter("valor")));
            d.setFornecedor(request.getParameter("fornecedor"));
            if (Function.isInicioBarraInvertida(d.getFornecedor())) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.setContentType("text/plain;charset=UTF-8");
                response.getWriter().write("O Fornecedor não pode iniciar com barra invertida.");
                return;
            }

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
