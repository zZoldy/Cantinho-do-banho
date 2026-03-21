/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Agendamento;
import java.util.List;
import javax.persistence.EntityManager;

public class AgendamentoDAO {

    // Salva um novo agendamento ou atualiza um existente (ex: mudar status)
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

    // Busca todos os agendamentos para o Dashboard
    public List<Agendamento> listarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // JPQL buscando pela classe Agendamento
            return em.createQuery("FROM Agendamento", Agendamento.class).getResultList();
        } finally {
            em.close();
        }
    }

    // Busca apenas agendamentos por status (útil para a aba "Novos Pedidos")
    public List<Agendamento> buscarPorStatus(String status) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT a FROM Agendamento a WHERE a.status = :pStatus", Agendamento.class)
                    .setParameter("pStatus", status)
                    .getResultList();
        } finally {
            em.close();
        }
    }

}
