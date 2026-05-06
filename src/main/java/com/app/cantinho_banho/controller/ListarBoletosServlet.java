package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.JPAUtil;
import com.app.cantinho_banho.model.Boleto;

import javax.persistence.EntityManager;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/api/boletos/listar")
public class ListarBoletosServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        PrintWriter out = response.getWriter();

        EntityManager em = JPAUtil.getEntityManager();
        try {
            List<Boleto> boletos = em.createQuery("SELECT b FROM Boleto b ORDER BY b.dataVencimento ASC", Boleto.class).getResultList();

            StringBuilder json = new StringBuilder();
            json.append("[");

            for (int i = 0; i < boletos.size(); i++) {
                Boleto b = boletos.get(i);
                
                String linha = b.getLinhaDigitavel() != null ? b.getLinhaDigitavel() : "";
                String desc = b.getDescricao() != null ? b.getDescricao() : "Boleto";
                String vencimento = b.getDataVencimento() != null ? b.getDataVencimento() : "";
                String status = b.getStatus() != null ? b.getStatus() : "Pendente";
                Double valor = b.getValor() != null ? b.getValor() : 0.0;
                
                json.append("{")
                    .append("\"id\": ").append(b.getId()).append(", ")
                    .append("\"descricao\": \"").append(desc).append("\", ")
                    .append("\"valor\": ").append(valor).append(", ")
                    .append("\"dataVencimento\": \"").append(vencimento).append("\", ")
                    .append("\"linhaDigitavel\": \"").append(linha).append("\", ")
                    .append("\"status\": \"").append(status).append("\"")
                    .append("}");

                if (i < boletos.size() - 1) {
                    json.append(", ");
                }
            }
            json.append("]");

            out.print(json.toString());

        } catch (Exception e) {
            e.printStackTrace();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("[]"); 
        } finally {
            em.close();
            out.flush();
        }
    }
}