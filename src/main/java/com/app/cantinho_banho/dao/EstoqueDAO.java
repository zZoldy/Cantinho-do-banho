package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Estoque;
import java.util.List;
import javax.persistence.EntityManager;

public class EstoqueDAO {

    public void salvar(Estoque estoque) {
        EntityManager em = JPAUtil.getEntityManager();

        try {
            em.getTransaction().begin();

            if (estoque.getId() == null) {
                em.persist(estoque);
            } else {
                em.merge(estoque);
            }

            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public Estoque buscarPorProdutoId(Long produtoId) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT e  FROM Estoque e WHERE e.produto.id = :produtoId", Estoque.class)
                    .setParameter("produtoId", produtoId)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        } finally {
            em.close();
        }
    }

    public List<Estoque> listarTodosEstoque() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT e FROM Estoque e", Estoque.class)
                    .getResultList();
        } finally {
            em.close();
        }
    }
}
