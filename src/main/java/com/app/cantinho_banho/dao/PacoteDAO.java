package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Pacote;
import java.util.List;
import javax.persistence.EntityManager;

public class PacoteDAO {

    public void salvar(Pacote pacote) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(pacote);
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

    public Pacote buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.find(Pacote.class, id);
        } finally {
            em.close();
        }
    }

    public List<Pacote> listarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT p FROM Pacote p", Pacote.class).getResultList();
        } finally {
            em.close();
        }
    }

    public void remover(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            Pacote pacote = em.find(Pacote.class, id);
            if (pacote != null) {
                em.remove(pacote);
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
}