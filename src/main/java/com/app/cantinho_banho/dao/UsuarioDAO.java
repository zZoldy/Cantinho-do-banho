package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Usuario;
import java.util.List;
import javax.persistence.EntityManager;

public class UsuarioDAO {

    public void salvar(Usuario usuario) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(usuario);
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

    public void atualizar(Usuario usuario) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(usuario);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public Usuario buscarPorEmail(String email) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT u FROM Usuario u WHERE u.email = :pEmail", Usuario.class)
                    .setParameter("pEmail", email)
                    .getSingleResult();
        } catch (javax.persistence.NoResultException e) {
            // Retorna null se não encontrar ninguém com esse e-mail
            return null;
        } finally {
            em.close();
        }
    }

    public boolean existeEmail(String email) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Long quantidade = em.createQuery("SELECT COUNT(u) FROM Usuario u WHERE u.email = :pEmail", Long.class)
                    .setParameter("pEmail", email)
                    .getSingleResult();
            return quantidade > 0;
        } catch (Exception e) {
            return false;
        } finally {
            em.close();
        }
    }

    public boolean existeCpf(String cpf) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Long quantidade = em.createQuery("SELECT COUNT(u) FROM Usuario u WHERE u.cpf = :pCpf", Long.class)
                    .setParameter("pCpf", cpf)
                    .getSingleResult();
            return quantidade > 0;
        } catch (Exception e) {
            return false;
        } finally {
            em.close();
        }
    }

    // Apenas usuários com a conta Ativada
    public List<Usuario> buscarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT u FROM Usuario u WHERE u.ativo = true", Usuario.class)
                    .getResultList();
        } finally {
            em.close();
        }
    }

    public Usuario buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.find(Usuario.class, id);
        } finally {
            em.close();
        }
    }
}
