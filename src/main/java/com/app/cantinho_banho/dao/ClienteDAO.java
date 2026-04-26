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

    public Long buscarIdPorTelefoneENome(String telefone, String nome) {
        EntityManager em = JPAUtil.getEntityManager(); //
        try {
            return em.createQuery("SELECT c.id FROM Cliente c WHERE c.telefone = :pTelefone AND c.nome = :pNome", Long.class)
                    .setParameter("pTelefone", telefone)
                    .setParameter("pNome", nome)
                    .getSingleResult();
        } catch (Exception e) {
            return null;
        } finally {
            em.close();
        }
    }

    public Long existeTelefone(String telefone) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // Agora fazemos um SELECT no ID do cliente em vez de contar
            return em.createQuery("SELECT c.id FROM Cliente c WHERE c.telefone = :pTelefone", Long.class)
                    .setParameter("pTelefone", telefone)
                    .setMaxResults(1) // Garante que traz apenas 1 resultado, evitando erros de duplicidade
                    .getSingleResult();
        } catch (Exception e) {
            // Se não encontrar o telefone, cai no catch e retorna nulo
            return null;
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

    public boolean temUsuario(Long clienteId) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            // Conta quantos clientes com este ID possuem a coluna usuario_id preenchida
            Long quantidade = em.createQuery(
                    "SELECT COUNT(c) FROM Cliente c WHERE c.id = :pId AND c.usuario IS NOT NULL", Long.class)
                    .setParameter("pId", clienteId)
                    .getSingleResult();

            return quantidade > 0;
        } catch (Exception e) {
            return false;
        } finally {
            em.close();
        }
    }

    public Cliente buscarDuplicadoSemUsuario(String nome, String telefone, Long idAtual) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            String jpql = "SELECT c FROM Cliente c WHERE c.nome = :nome AND c.telefone = :telefone "
                    + "AND c.usuario IS NULL AND c.id <> :idAtual";
            return em.createQuery(jpql, Cliente.class)
                    .setParameter("nome", nome)
                    .setParameter("telefone", telefone)
                    .setParameter("idAtual", idAtual)
                    .getResultList()
                    .stream()
                    .findFirst()
                    .orElse(null);
        } finally {
            em.close();
        }
    }

    public void fundirClientes(Cliente origem, Cliente destino) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();

            em.createQuery("UPDATE Pet p SET p.dono = :destino WHERE p.dono = :origem")
                    .setParameter("destino", destino)
                    .setParameter("origem", origem)
                    .executeUpdate();

            // 2. Remove o registro duplicado (agora sem pets vinculados)
            Cliente paraRemover = em.find(Cliente.class, origem.getId());
            if (paraRemover != null) {
                em.remove(paraRemover);
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
}
