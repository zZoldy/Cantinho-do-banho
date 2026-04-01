/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Agendamento;
import com.app.cantinho_banho.model.Cliente;
import java.util.List;
import javax.persistence.EntityManager;

public class AgendamentoDAO {

    public void salvarOuAtualizar(Agendamento agendamento) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(agendamento);
            em.getTransaction().commit();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw e;
        } finally {
            em.close();
        }
    }

    public List<Agendamento> listarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT a FROM Agendamento a ORDER BY a.data DESC, a.hora ASC", Agendamento.class)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    public Agendamento buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.find(Agendamento.class, id);
        } finally {
            em.close();
        }
    }

    public void remover(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            Agendamento agendamento = em.find(Agendamento.class, id);
            if (agendamento != null) {
                em.remove(agendamento);
            }
            em.getTransaction().commit();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw e;
        } finally {
            em.close();
        }
    }

    public void concluirComDesconto(Agendamento agendamento, Cliente cliente) throws Exception {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            if (cliente != null) {
                em.merge(cliente); 
            }
            em.merge(agendamento); 

            em.getTransaction().commit();

        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw new Exception("Erro ao salvar transação conjunta: " + e.getMessage());
        } finally {
            em.close();
        }
    }
}
