package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Despesa;
import java.util.List;
import javax.persistence.EntityManager;

public class DespesaDAO {

    public void salvar(Despesa despesa) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(despesa);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public List<Despesa> listarTodas() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT d FROM Despesa d ORDER BY d.dataCriacao DESC", Despesa.class).getResultList();
        } finally {
            em.close();
        }
    }

    public Despesa buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.find(Despesa.class, id);
        } finally {
            em.close();
        }
    }

    public void atualizar(Despesa despesa) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(despesa);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public void excluir(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            Despesa despesa = em.find(Despesa.class, id);
            if (despesa != null) {
                em.remove(despesa);
            }
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }
}
