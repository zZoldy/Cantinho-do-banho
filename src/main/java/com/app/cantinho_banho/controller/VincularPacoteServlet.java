package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.dao.PacoteDAO;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Pacote;
import java.io.IOException;
import java.time.LocalDate;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/clientes/vincular-pacote")
public class VincularPacoteServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        try {
            Long clienteId = Long.parseLong(request.getParameter("clienteId"));
            Long pacoteId = Long.parseLong(request.getParameter("pacoteId"));

            ClienteDAO clienteDAO = new ClienteDAO();
            PacoteDAO pacoteDAO = new PacoteDAO();

            Cliente cliente = clienteDAO.buscarPorId(clienteId);
            Pacote pacote = pacoteDAO.buscarPorId(pacoteId);

            if (cliente != null && pacote != null) {
                cliente.setPacoteAtivo(pacote);
                cliente.setSessoesUsadas(0); // Zera os banhos usados
                cliente.setValidadePacote(LocalDate.now().plusDays(pacote.getValidadeDias()));

                clienteDAO.salvar(cliente);

                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"sucesso\": true}");
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            }
        } catch (IOException | NumberFormatException e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}