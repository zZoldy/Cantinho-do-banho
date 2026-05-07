package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.BoletoDAO;
import com.app.cantinho_banho.model.Boleto;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/boletos/cadastrar")
public class CadastrarBoletoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");

        try {
            Boleto boleto = new Boleto();
            boleto.setDescricao(request.getParameter("descricao"));
            boleto.setValor(Double.parseDouble(request.getParameter("valor")));
            boleto.setDataVencimento(request.getParameter("dataVencimento"));
            boleto.setLinhaDigitavel(request.getParameter("linhaDigitavel"));
            boleto.setStatus("Pendente");

            BoletoDAO dao = new BoletoDAO();
            dao.salvar(boleto);

            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"mensagem\": \"Boleto cadastrado com sucesso!\"}");
            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosBoletos();
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"erro\": \"Erro ao salvar boleto.\"}");
        }
    }
}
