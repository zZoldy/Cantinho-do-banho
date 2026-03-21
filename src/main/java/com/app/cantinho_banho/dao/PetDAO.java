/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Pet;
import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

/**
 *
 * @author Z D K
 */
public class PetDAO {

    public void salvarOuAtualizar(Pet pet) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(pet); // Aqui a mágica acontece: o Java gera o INSERT SQL
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
        } finally {
            em.close();
        }
    }

    public Pet buscarPorId(Long id) {
        // 1. Abrimos a "porta" para o banco de dados
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // 2. Usamos o método find: (Classe que queremos, ID que buscamos)
            Pet petEncontrado = em.find(Pet.class, id);
            return petEncontrado;
        } finally {
            // 3. Importante: Sempre fechamos a porta para não gastar memória
            em.close();
        }
    }
}
