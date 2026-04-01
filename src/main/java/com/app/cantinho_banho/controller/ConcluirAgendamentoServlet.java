package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.AgendamentoDAO;
import com.app.cantinho_banho.dao.FuncionarioDAO;
import com.app.cantinho_banho.model.Agendamento;
import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Funcionario;
import com.app.cantinho_banho.model.Pacote;
import com.app.cantinho_banho.model.Servico;
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
            if (hEntrada == null) hEntrada = request.getParameter("entradaPet");
            
            String hSaida = request.getParameter("saida_pet");
            if (hSaida == null) hSaida = request.getParameter("saidaPet");
            
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
                
                if (formaPag != null) a.setFormPagamento(formaPag);
                if (statusPag != null) a.setStatusPagamento(statusPag);
                if (obsInternas != null) a.setObs(obsInternas);

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

                Cliente cliente = a.getPet().getDono(); 
                Pacote pacoteAtivo = cliente.getPacoteAtivo();
                
                boolean houveDesconto = false;

                if (pacoteAtivo != null && "Confirmado".equals(statusAnteriorBanco) && "Retirada".equals(novoStatus)) {
                    
                    Servico servicoRealizado = a.getServico();
                    Servico servicoDoPacote = pacoteAtivo.getServico();

                    if (servicoRealizado != null && servicoDoPacote != null &&
                        servicoRealizado.getId().equals(servicoDoPacote.getId())) {

                        int usadas = cliente.getSessoesUsadas() != null ? cliente.getSessoesUsadas() : 0;
                        cliente.setSessoesUsadas(usadas + 1);
                        houveDesconto = true;

                        if (cliente.getSessoesUsadas() >= pacoteAtivo.getQuantidadeSessoes()) {
                            cliente.setPacoteAtivo(null);
                            cliente.setSessoesUsadas(0);
                            cliente.setValidadePacote(null);
                        }
                    }
                }
                // ==============================================================

                dao.concluirComDesconto(a, houveDesconto ? cliente : null);

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