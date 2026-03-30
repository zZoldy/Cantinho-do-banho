package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Pet;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;

public class PetDAO {

    public void salvarOuAtualizar(Pet pet) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(pet);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
        } finally {
            em.close();
        }
    }

    public Pet buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            Pet petEncontrado = em.find(Pet.class, id);
            return petEncontrado;
        } finally {
            em.close();
        }
    }

    public Pet buscarPorNomeEDono(String nomePet, Long idDono) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery(
                    "SELECT p FROM Pet p WHERE p.nome = :pNome AND p.dono.id = :pDonoId",
                    Pet.class)
                    .setParameter("pNome", nomePet)
                    .setParameter("pDonoId", idDono)
                    .getSingleResult();
        } catch (NoResultException e) {
            // Se o dono não tiver nenhum pet com esse nome, retorna null
            return null;
        } finally {
            em.close();
        }
    }
}
