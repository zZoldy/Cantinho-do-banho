package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.PacoteDAO;
import com.app.cantinho_banho.model.Pacote;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/pacotes/cadastrar")
public class CadastrarPacoteServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        
        try {
            String nome = request.getParameter("nome");
            int sessoes = Integer.parseInt(request.getParameter("sessoes"));
            int validade = Integer.parseInt(request.getParameter("validade"));
            double valor = Double.parseDouble(request.getParameter("valor"));

            Pacote pacote = new Pacote();
            pacote.setNome(nome);
            pacote.setQuantidadeSessoes(sessoes);
            pacote.setValidadeDias(validade);
            pacote.setValor(valor);

            PacoteDAO dao = new PacoteDAO();
            dao.salvar(pacote);
            
            response.setStatus(HttpServletResponse.SC_OK);
            response.getWriter().write("{\"sucesso\": true}");
            
        } catch (IOException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("Erro ao salvar pacote.");
        }
    }
}