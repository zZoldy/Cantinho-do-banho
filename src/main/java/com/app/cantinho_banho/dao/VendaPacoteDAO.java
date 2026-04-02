/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.VendaPacote;
import java.util.List;
import javax.persistence.EntityManager;
import javax.persistence.NoResultException;

public class VendaPacoteDAO {

    private EntityManager em;

    public VendaPacoteDAO() {
        this.em = JPAUtil.getEntityManager();
    }

    public void salvar(VendaPacote venda) {
        try {
            em.getTransaction().begin();
            em.persist(venda);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }

    public List<VendaPacote> listarTodas() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // Faz o JOIN com Cliente e Pacote para trazer os nomes para o relatório
            return em.createQuery(
                    "SELECT v FROM VendaPacote v JOIN FETCH v.cliente JOIN FETCH v.pacote ORDER BY v.dataVenda DESC",
                    VendaPacote.class
            ).getResultList();
        } finally {
            em.close();
        }
    }

    // 🟢 Método para atualizar o saldo de sessões após o uso
    public void atualizar(VendaPacote venda) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(venda);
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

    public VendaPacote buscarVendaAtiva(Long clienteId, Long servicoId) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery(
                    "SELECT v FROM VendaPacote v "
                    + "WHERE v.cliente.id = :clienteId "
                    + "AND v.pacote.servico.id = :servicoId "
                    + "AND v.sessoesRestantes > 0 "
                    + "ORDER BY v.dataVenda ASC", VendaPacote.class) // Garante o uso do pacote mais antigo primeiro
                    .setParameter("clienteId", clienteId)
                    .setParameter("servicoId", servicoId)
                    .setMaxResults(1)
                    .getSingleResult();
        } catch (NoResultException e) {
            return null; // Cliente não tem pacote para este serviço ou o saldo acabou
        } finally {
            em.close();
        }
    }
    
    public List<VendaPacote> listarAtivosPorCliente(Long clienteId) {
    EntityManager em = JPAUtil.getEntityManager();
        return em.createQuery("SELECT v FROM VendaPacote v WHERE v.cliente.id = :cId AND v.sessoesRestantes > 0", VendaPacote.class)
                .setParameter("cId", clienteId)
             .getResultList();
}
}
