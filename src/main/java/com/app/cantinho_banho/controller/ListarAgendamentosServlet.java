package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.AgendamentoDAO;
import com.app.cantinho_banho.model.Agendamento;
import java.io.IOException;
import java.util.List;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/api/agendamentos/listar")
public class ListarAgendamentosServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        AgendamentoDAO dao = new AgendamentoDAO();
        List<Agendamento> lista = dao.listarTodos();

        StringBuilder json = new StringBuilder();
        json.append("[");

        for (int i = 0; i < lista.size(); i++) {
            Agendamento a = lista.get(i);

            String nomePet = (a.getPet() != null) ? a.getPet().getNome() : "Não informado";
            String nomeDono = (a.getPet() != null && a.getPet().getDono() != null) ? a.getPet().getDono().getNome() : "Sem dono";
            String telDono = (a.getPet() != null && a.getPet().getDono() != null) ? a.getPet().getDono().getTelefone() : "";
            String tipoPet = (a.getPet() != null) ? a.getPet().getTipo() : "";

            String nomeFunc = (a.getFuncionario() != null && a.getFuncionario().getUsuario() != null)
                    ? a.getFuncionario().getUsuario().getNome() : "null";

            json.append("{");
            json.append("\"id\":").append(a.getId()).append(",");
            json.append("\"pet\":\"").append(escapeJson(nomePet)).append("\",");
            json.append("\"dono\":\"").append(escapeJson(nomeDono)).append("\",");
            json.append("\"contato\":\"").append(escapeJson(telDono)).append("\",");
            json.append("\"tipo\":\"").append(escapeJson(tipoPet)).append("\",");
            json.append("\"servico\":\"").append(a.getServico().getNome()).append("\",");
            json.append("\"valor\":").append(a.getValor()).append(",");
            json.append("\"funcionario\":\"").append(escapeJson(nomeFunc)).append("\",");
            json.append("\"formaPag\":\"").append(escapeJson(a.getFormPagamento())).append("\",");
            json.append("\"status\":\"").append(escapeJson(a.getStatus())).append("\",");
            json.append("\"status_pagamento\":\"").append(escapeJson(a.getStatusPagamento())).append("\",");
            json.append("\"hora\":\"").append(a.getHora() != null ? a.getHora().toString() : "").append("\",");
            json.append("\"data\":\"").append(a.getData() != null ? a.getData().toString() : "").append("\",");

            json.append("\"entrada_pet\":\"").append(a.getEntrada_pet() != null ? a.getEntrada_pet().toString() : "").append("\",");
            json.append("\"saida_pet\":\"").append(a.getSaida_pet() != null ? a.getSaida_pet().toString() : "").append("\",");
            json.append("\"obs\":\"").append(escapeJson(a.getObs())).append("\"");
            json.append("}");

            if (i < lista.size() - 1) {
                json.append(",");
            }
        }
        json.append("]");

        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(json.toString());
    }

    private String escapeJson(String texto) {
        if (texto == null) {
            return "";
        }
        return texto.replace("\"", "\\\"").replace("\n", "\\n").replace("\r", "");
    }
}
