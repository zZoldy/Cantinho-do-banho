package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.Pacote;
import java.util.List;
import javax.persistence.EntityManager;

public class PacoteDAO {

    public void salvar(Pacote pacote) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(pacote);
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

    public Pacote buscarPorId(Long id) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.find(Pacote.class, id);
        } finally {
            em.close();
        }
    }

    public List<Pacote> listarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            return em.createQuery("SELECT p FROM Pacote p", Pacote.class).getResultList();
        } finally {
            em.close();
        }
    }

    public void excluir(Long id) throws Exception {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            Pacote pacote = em.find(Pacote.class, id);
            if (pacote == null) {
                throw new Exception("Pacote não encontrado.");
            }

            javax.persistence.Query query = em.createQuery(
                    "UPDATE Cliente c SET c.pacoteAtivo = null, c.sessoesUsadas = 0, c.validadePacote = null WHERE c.pacoteAtivo.id = :pacoteId"
            );
            query.setParameter("pacoteId", id);
            int clientesAfetados = query.executeUpdate(); 

            em.remove(pacote);

            em.getTransaction().commit();

            System.out.println("Pacote excluído. " + clientesAfetados + " clientes tiveram seus planos cancelados.");

        } catch (Exception e) {
            em.getTransaction().rollback();
            throw new Exception("Erro ao tentar excluir o pacote no banco de dados: " + e.getMessage());
        } finally {
            em.close();
        }
    }
}
