package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.ClienteDAO;
import com.app.cantinho_banho.dao.PacoteDAO;
import com.app.cantinho_banho.dao.VendaPacoteDAO;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Pacote;
import com.app.cantinho_banho.model.VendaPacote;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/clientes/vincular-pacote")
public class VincularPacoteServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        try {
            Long clienteId = Long.parseLong(request.getParameter("clienteId"));
            Long pacoteId = Long.parseLong(request.getParameter("pacoteId"));
            String formaPagamento = request.getParameter("formaPagamento"); // Novo parâmetro vindo do front

            ClienteDAO clienteDAO = new ClienteDAO();
            PacoteDAO pacoteDAO = new PacoteDAO();
            VendaPacoteDAO vendaDAO = new VendaPacoteDAO(); // Você precisará criar esta classe DAO

            Cliente cliente = clienteDAO.buscarPorId(clienteId);
            Pacote pacote = pacoteDAO.buscarPorId(pacoteId);

            if (cliente != null && pacote != null) {
                VendaPacote pacoteExistente = vendaDAO.buscarVendaAtiva(cliente.getId(), pacote.getServico().getId());

                if (pacoteExistente != null) {
                    response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                    String msg = "O cliente já possui um pacote ativo para o serviço '"
                            + pacote.getServico().getNome() + "' com "
                            + pacoteExistente.getSessoesRestantes() + " sessão(ões) restante(s).";

                    response.getWriter().write("{\"sucesso\": false, \"erro\": \"" + msg + "\"}");
                    return;
                }

                VendaPacote venda = new VendaPacote();
                venda.setCliente(cliente);
                venda.setPacote(pacote);
                venda.setDataVenda(LocalDateTime.now());
                venda.setValorPago(pacote.getValor());
                venda.setFormaPagamento(formaPagamento != null ? formaPagamento : "Não Informado");
                venda.setSessoesRestantes(pacote.getQuantidadeSessoes());

                vendaDAO.salvar(venda); // Persiste o registro de venda

                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"sucesso\": true, \"mensagem\": \"Pacote vinculado e venda registrada!\"}");
                
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosCadCliente();
            } else {
                response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                response.getWriter().write("{\"sucesso\": false, \"erro\": \"Cliente ou Pacote não encontrado.\"}");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"sucesso\": false, \"erro\": \"" + e.getMessage() + "\"}");
        }
    }
}
