package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Boleto;
import javax.persistence.EntityManager;
import java.util.List;

public class BoletoDAO {

    public void salvar(Boleto boleto) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(boleto);
            em.getTransaction().commit();
        } finally {
            em.close();
        }
    }

    public List<Boleto> listarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT b FROM Boleto b ORDER BY b.dataVencimento ASC", Boleto.class).getResultList();
        } finally {
            em.close();
        }
    }

    public void atualizarStatus(Long id, String novoStatus) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            Boleto boleto = em.find(Boleto.class, id);
            if (boleto != null) {
                boleto.setStatus(novoStatus);
            }
            em.getTransaction().commit();
        } finally {
            em.close();
        }
    }

    public void excluir(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            Boleto boleto = em.find(Boleto.class, id);

            if (boleto != null) {
                em.remove(boleto);
                em.getTransaction().commit();
            } else {
                em.getTransaction().rollback();
            }
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            e.printStackTrace();
        } finally {
            em.close();
        }
    }
}
