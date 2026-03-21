/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Usuario;
import java.util.Random;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;
import org.mindrot.jbcrypt.BCrypt;

/**
 *
 * @author Z D K
 */
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

    public String gerarMatriculaUnica() {
        EntityManager em = JPAUtil.getEntityManager();
        Random random = new Random();
        String matriculaGerada;
        boolean repetida;

        try {
            do {
                // 1. Sorteia o número
                int numero = 100000 + random.nextInt(900000);
                matriculaGerada = "CDB-" + numero;

                // 2. Pergunta ao banco se alguém já tem essa matrícula
                Long quantidade = em.createQuery(
                        "SELECT COUNT(u) FROM Usuario u WHERE u.matricula = :pMatricula", Long.class)
                        .setParameter("pMatricula", matriculaGerada)
                        .getSingleResult();

                // Se a quantidade for maior que 0, é porque já existe!
                repetida = (quantidade > 0);

            } while (repetida); // Se for repetida, o loop volta e sorteia outra vez!

            return matriculaGerada; // Quando sair do loop, temos uma matrícula 100% virgem

        } finally {
            em.close();
        }
    }

    public Usuario autenticar(String email, String senhaDigitada) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // 1. Busca APENAS pelo e-mail e verifica se está ativo
            Usuario usuario = em.createQuery(
                    "SELECT u FROM Usuario u WHERE u.email = :pEmail AND u.ativo = true",
                    Usuario.class)
                    .setParameter("pEmail", email)
                    .getSingleResult();

            // 2. Verifica se a senha digitada corresponde ao Hash do banco
            if (BCrypt.checkpw(senhaDigitada, usuario.getSenha())) {
                return usuario; // Senha correta! Entra no sistema.
            } else {
                return null; // Senha errada!
            }

        } catch (NoResultException e) {
            // Se não encontrar ninguém com esse e-mail (ou estiver inativo)
            return null;
        } finally {
            em.close();
        }
    }
}
