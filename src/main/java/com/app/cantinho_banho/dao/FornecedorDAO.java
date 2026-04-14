package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Fornecedor;
import java.util.List;
import javax.persistence.EntityManager;

public class FornecedorDAO {

    public void salvar(Fornecedor fornecedor) {
        EntityManager em = JPAUtil.getEntityManager();

        try {
            em.getTransaction().begin();
            if (fornecedor.getId() == null) {
                em.persist(fornecedor);
            } else {
                em.merge(fornecedor);
            }
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public List<Fornecedor> listarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT f FROM Fornecedor f WHERE f.ativo = true", Fornecedor.class).getResultList();
        } finally {
            em.close();
        }
    }

    public Fornecedor buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.find(Fornecedor.class, id);
        } finally {
            em.close();
        }
    }

    public void atualizar(Fornecedor fornecedor) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(fornecedor);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

}
