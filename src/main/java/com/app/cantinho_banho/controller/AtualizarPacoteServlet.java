package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.PacoteDAO;
import com.app.cantinho_banho.dao.ServicoDAO;
import com.app.cantinho_banho.model.Pacote;
import com.app.cantinho_banho.model.Servico;
import com.app.cantinho_banho.resources.Function;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/api/pacotes/atualizar")
public class AtualizarPacoteServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        req.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json; charset=UTF-8");

        try {
            Long id = Long.parseLong(req.getParameter("id"));
            String nome = req.getParameter("nome");
            if (Function.isInicioBarraInvertida(nome)) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.setContentType("text/plain;charset=UTF-8");
                resp.getWriter().write("O Nome não pode iniciar com barra invertida.");
                return;
            }
            
            int sessoes = Integer.parseInt(req.getParameter("sessoes"));
            int validade = Integer.parseInt(req.getParameter("validade"));
            Double valor = Double.parseDouble(req.getParameter("valor"));
            Long servicoId = Long.parseLong(req.getParameter("servicoId"));

            PacoteDAO pacoteDAO = new PacoteDAO();
            ServicoDAO servicoDAO = new ServicoDAO();

            // 1. Busca o pacote existente no banco
            Pacote pacote = pacoteDAO.buscarPorId(id);

            if (pacote == null) {
                resp.setStatus(HttpServletResponse.SC_NOT_FOUND);
                resp.getWriter().write("Pacote não encontrado.");
                return;
            }

            // 2. Busca o serviço atualizado
            Servico servico = servicoDAO.buscarPorId(servicoId);
            if (servico == null) {
                resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
                resp.getWriter().write("Serviço vinculado não existe.");
                return;
            }

            // 3. Atualiza os dados
            pacote.setNome(nome);
            pacote.setQuantidadeSessoes(sessoes);
            pacote.setValidadeDias(validade);
            pacote.setValor(valor);
            pacote.setServico(servico);

            // 4. Salva (merge fará o UPDATE)
            pacoteDAO.salvar(pacote);

            resp.setStatus(HttpServletResponse.SC_OK);
            resp.getWriter().write("{\"status\": \"Pacote atualizado com sucesso\"}");

        } catch (NumberFormatException e) {
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("Erro nos dados enviados. Verifique números e valores vazios.");
        } catch (Exception e) {
            e.printStackTrace();
            resp.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            resp.getWriter().write("Erro interno: " + e.getMessage());
        }
    }
}
