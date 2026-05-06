package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Estoque;
import com.app.cantinho_banho.model.Produto;
import com.app.cantinho_banho.model.Venda;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import java.util.List;

public class VendaDAO {

    public void salvar(Venda venda) throws Exception {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            if (venda.getProduto() != null && venda.getProduto().getId() != null) {

                Produto produtoGerenciado = em.find(Produto.class, venda.getProduto().getId());
                venda.setProduto(produtoGerenciado);

                if (produtoGerenciado != null) {
                    try {
                        Estoque estoque = em.createQuery("SELECT e FROM Estoque e WHERE e.produto.id = :produtoId", Estoque.class)
                                .setParameter("produtoId", produtoGerenciado.getId())
                                .getSingleResult();

                        if (venda.getQuantidade() > estoque.getQuantidadeAtual()) {
                            throw new Exception("Estoque insuficiente! Você tem apenas " + estoque.getQuantidadeAtual() + " unidades de " + produtoGerenciado.getNome() + ".");
                        }

                        estoque.setQuantidadeAtual(estoque.getQuantidadeAtual() - venda.getQuantidade());
                        em.merge(estoque);

                    } catch (NoResultException e) {
                        System.out.println("Aviso: Registro de estoque não encontrado para o Produto ID: " + produtoGerenciado.getId());
                    }
                }
            }

            em.persist(venda);
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

    public List<Venda> listarTodas() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT v FROM Venda v ORDER BY v.dataVenda DESC", Venda.class).getResultList();
        } finally {
            em.close();
        }
    }

    public void atualizarStatusNf(Long id, boolean nfEmitida) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            Venda venda = em.find(Venda.class, id);
            if (venda != null) {
                venda.setNfEmitida(nfEmitida);
            }
            em.getTransaction().commit();
        } finally {
            em.close();
        }
    }
}
