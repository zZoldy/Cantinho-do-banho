package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.AgendamentoDAO;
import com.app.cantinho_banho.dao.FuncionarioDAO;
import com.app.cantinho_banho.model.Agendamento;
import com.app.cantinho_banho.model.Funcionario;
import java.io.IOException;
import java.time.LocalTime;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/agendamentos/atualizar")
public class AtualizarAgendamentoServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
        request.setCharacterEncoding("UTF-8");
        response.setCharacterEncoding("UTF-8");
        
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            AgendamentoDAO dao = new AgendamentoDAO();
            Agendamento a = dao.buscarPorId(id);

            if (a != null) {
                String nomeFuncionario = request.getParameter("funcionario");
                String strValor = request.getParameter("valor");
                String formaPag = request.getParameter("formaPag");
                String statusPag = request.getParameter("status_pagamento");
                String hEntrada = request.getParameter("entrada_pet");
                String hSaida = request.getParameter("saida_pet");
                String obsInternas = request.getParameter("obs");

                if (strValor != null && !strValor.isEmpty()) {
                    a.setValor(Double.parseDouble(strValor));
                }
                a.setFormPagamento(formaPag);
                a.setStatusPagamento(statusPag);
                a.setObs(obsInternas);

                if (hEntrada != null && !hEntrada.isEmpty()) {
                    a.setEntrada_pet(LocalTime.parse(hEntrada));
                }
                if (hSaida != null && !hSaida.isEmpty()) {
                    a.setSaida_pet(LocalTime.parse(hSaida));
                }

                if (nomeFuncionario != null && !nomeFuncionario.trim().isEmpty()) {
                    FuncionarioDAO funcDao = new FuncionarioDAO();
                    Funcionario f = funcDao.buscarPorNome(nomeFuncionario);
                    if (f != null) {
                        a.setFuncionario(f);
                    }
                } else {
                    a.setFuncionario(null);
                }
                dao.salvarOuAtualizar(a);
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodos();
                response.setStatus(HttpServletResponse.SC_OK);
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        }
    }
}
