package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ServicoDAO;
import com.app.cantinho_banho.model.Servico;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/servicos/cadastrar")
public class CadastrarServicoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");

        try {
            String nome = request.getParameter("nome");
            String valorStr = request.getParameter("valor");
            
            if (nome == null || nome.isEmpty() || valorStr == null || valorStr.isEmpty()) {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                return;
            }

            Servico s = new Servico();
            s.setNome(nome);
            s.setValor(Double.parseDouble(valorStr.replace(",", ".")));

            ServicoDAO dao = new ServicoDAO();
            dao.salvar(s);

            response.setStatus(HttpServletResponse.SC_CREATED);

            com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosServico();

        } catch (NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
