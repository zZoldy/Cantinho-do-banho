package com.app.cantinho_banho.controller;

import com.app.cantinho_banho.dao.JPAUtil;
import com.app.cantinho_banho.model.Despesa;

import javax.persistence.EntityManager;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDate;

@WebServlet("/api/despesas/baixar")
public class BaixarDespesaServlet extends HttpServlet {

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        // Garantindo o retorno em JSON para o frontend
        response.setContentType("application/json;charset=UTF-8");
        
        EntityManager em = JPAUtil.getEntityManager();
        
        try {
            Long id = Long.parseLong(request.getParameter("id"));
            
            em.getTransaction().begin();
            
            Despesa despesa = em.find(Despesa.class, id);

            if (despesa != null) {
                despesa.setStatus("PAGO");
                
                // Opcional, mas recomendado: Registrar quando a despesa foi paga
                // despesa.setDataPagamento(LocalDate.now()); 
                
                em.merge(despesa);
                
                em.getTransaction().commit();
                
                response.setStatus(HttpServletResponse.SC_OK);
                response.getWriter().write("{\"status\":\"success\"}");
                
                com.app.cantinho_banho.websocket.AtualizacaoWebSocket.notificarTodosDespesa();
            } else {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                response.getWriter().write("{\"erro\":\"Despesa não encontrada.\"}");
            }
        } catch (Exception e) {
            if (em != null && em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.getWriter().write("{\"erro\":\"Erro ao baixar despesa: " + e.getMessage() + "\"}");
        } finally {
            if (em != null) {
                em.close();
            }
        }
    }
}