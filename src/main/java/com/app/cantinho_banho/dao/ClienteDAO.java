package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Cliente;
import com.app.cantinho_banho.model.Usuario;
import java.util.List;
import javax.persistence.EntityManager;

public class ClienteDAO {

    public void atualizar(Cliente cliente) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(cliente);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public Cliente buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Cliente clienteEncontrado = em.find(Cliente.class, id);
            return clienteEncontrado;
        } finally {
            em.close();
        }
    }

    public Cliente buscarPorTelefoneENome(String telefone, String nome) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT c FROM Cliente c WHERE c.telefone = :pTelefone AND c.nome = :pNome",
                    Cliente.class).setParameter("pTelefone", telefone)
                    .setParameter("pNome", nome).getSingleResult();
        } catch (Exception e) {
            return null;
        } finally {
            em.close();
        }
    }

    public boolean existeTelefone(String telefone) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Long quantidade = em.createQuery("SELECT COUNT(c) FROM Cliente c WHERE c.telefone = :pTelefone", Long.class)
                    .setParameter("pTelefone", telefone)
                    .getSingleResult();
            return quantidade > 0;
        } catch (Exception e) {
            return false;
        } finally {
            em.close();
        }
    }

    public void salvar(Cliente cliente) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(cliente);
            em.getTransaction().commit();
        } catch (Exception e) {
            if (em.getTransaction().isActive()) {
                em.getTransaction().rollback();
            }
            throw e; // 🟢 ESSENCIAL: Joga o erro para a Servlet tratar!
        } finally {
            em.close();
        }
    }

    public List<Cliente> listarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT DISTINCT c FROM Cliente c LEFT JOIN FETCH c.pets", Cliente.class)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    public void criarAcessoEVincular(Cliente cliente, Usuario usuario) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            em.persist(usuario);

            cliente.setUsuario(usuario);
            em.merge(cliente);

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
