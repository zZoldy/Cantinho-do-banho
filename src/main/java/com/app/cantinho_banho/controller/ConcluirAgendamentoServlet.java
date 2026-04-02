package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.AgendamentoDAO;
import com.app.cantinho_banho.dao.FuncionarioDAO;
import com.app.cantinho_banho.dao.VendaPacoteDAO;
import com.app.cantinho_banho.model.Agendamento;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Funcionario;
import com.app.cantinho_banho.model.Pacote;
import com.app.cantinho_banho.model.Servico;
import com.app.cantinho_banho.model.VendaPacote;
import java.io.IOException;
import java.time.LocalTime;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/agendamentos/concluir")
public class ConcluirAgendamentoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");

        try {
            Long id = Long.parseLong(request.getParameter("id"));
            String novoStatus = request.getParameter("status");
            String nomeFuncionario = request.getParameter("funcionario");
            String strValor = request.getParameter("valor");
            String formaPag = request.getParameter("formaPag");
            String statusPag = request.getParameter("statusPag");

            String hEntrada = request.getParameter("entrada_pet");
            if (hEntrada == null) {
                hEntrada = request.getParameter("entradaPet");
            }

            String hSaida = request.getParameter("saida_pet");
            if (hSaida == null) {
                hSaida = request.getParameter("saidaPet");
            }

            String obsInternas = request.getParameter("obs");

            AgendamentoDAO dao = new AgendamentoDAO();
            Agendamento a = dao.buscarPorId(id);

            if (a != null) {
                String statusAnteriorBanco = a.getStatus();

                a.setStatus(novoStatus);

                if (strValor != null && !strValor.trim().isEmpty()) {
                    String valorLimpo = strValor.replace("R$", "").replace(".", "").replace(",", ".").trim();
                    a.setValor(Double.parseDouble(valorLimpo));
                }

                if (formaPag != null) {
                    a.setFormPagamento(formaPag);
                }
                if (statusPag != null) {
                    a.setStatusPagamento(statusPag);
                }
                if (obsInternas != null) {
                    a.setObs(obsInternas);
                }

                if (hEntrada != null && !hEntrada.isEmpty()) {
                    a.setEntrada_pet(LocalTime.parse(hEntrada));
                }
                if (hSaida != null && !hSaida.isEmpty()) {
                    a.setSaida_pet(LocalTime.parse(hSaida));
                }

                if (nomeFuncionario != null && !nomeFuncionario.trim().isEmpty() && !nomeFuncionario.equals("— Pegar Serviço —")) {
                    FuncionarioDAO funcDao = new FuncionarioDAO();
                    Funcionario f = funcDao.buscarPorNome(nomeFuncionario);
                    if (f != null) {
                        a.setFuncionario(f);
                    }
                } else if (request.getParameter("funcionario") != null) {
                    a.setFuncionario(null);
                }

                if ("Pacote".equals(formaPag) && "Confirmado".equals(statusAnteriorBanco) && "Retirada".equals(novoStatus)) {

                    VendaPacoteDAO vendaDAO = new VendaPacoteDAO();
                    // Busca a venda que possui o serviço específico deste agendamento
                    VendaPacote vendaAtiva = vendaDAO.buscarVendaAtiva(a.getPet().getDono().getId(), a.getServico().getId());

                    if (vendaAtiva != null) {
                        // Deduz a sessão da venda específica
                        vendaAtiva.setSessoesRestantes(vendaAtiva.getSessoesRestantes() - 1);
                        vendaDAO.atualizar(vendaAtiva);

                        // Não precisamos mais atualizar o 'cliente' aqui, 
                        // pois ele não tem mais campos de pacote.
                    }
                }
                // ==============================================================

                dao.salvarOuAtualizar(a);

                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodos();

                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (NumberFormatException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
