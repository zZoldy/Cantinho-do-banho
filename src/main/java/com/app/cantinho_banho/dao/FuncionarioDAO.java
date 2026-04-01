package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Funcionario;
import java.util.List;
import java.util.Random;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;

public class FuncionarioDAO {

    public void salvar(Funcionario funcionario) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.persist(funcionario);
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

    public void atualizar(Funcionario funcionario) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(funcionario);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public void remover(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            Funcionario f = em.find(Funcionario.class, id);

            if (f != null && f.getUsuario() != null) {
                f.getUsuario().setAtivo(false);
                em.merge(f);
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

    public String gerarMatriculaUnica() {
        EntityManager em = JPAUtil.getEntityManager();
        Random random = new Random();
        String matriculaGerada;
        boolean repetida;

        try {
            do {
                int numero = 100000 + random.nextInt(900000);
                matriculaGerada = "CDB-" + numero;

                Long quantidade = em.createQuery(
                        "SELECT COUNT(f) FROM Funcionario f WHERE f.matricula = :pMatricula", Long.class)
                        .setParameter("pMatricula", matriculaGerada)
                        .getSingleResult();

                repetida = (quantidade > 0);

            } while (repetida);

            return matriculaGerada;

        } finally {
            em.close();
        }
    }

    public List<Funcionario> buscarSomenteFuncionarios() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // O JPQL entra na classe Funcionario (f), vai até a classe Usuario, e olha o perfil!
            String jpql = "SELECT f FROM Funcionario f WHERE f.usuario.perfil NOT IN ('Admin', 'Administrador') AND f.usuario.ativo = true";

            return em.createQuery(jpql, Funcionario.class).getResultList();
        } finally {
            em.close();
        }
    }

    public List<Funcionario> buscarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            String jpql = "SELECT f FROM Funcionario f";

            return em.createQuery(jpql, Funcionario.class).getResultList();
        } finally {
            em.close();
        }
    }

    public Funcionario buscarPorNome(String nome) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            String jpql = "SELECT f FROM Funcionario f WHERE f.usuario.nome = :nomeDaTela";

            return em.createQuery(jpql, Funcionario.class)
                    .setParameter("nomeDaTela", nome)
                    .getSingleResult();

        } catch (NoResultException e) {
            return null;
        } finally {
            em.close();
        }
    }

    public Funcionario buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.find(Funcionario.class, id);
        } finally {
            em.close();
        }
    }
}
