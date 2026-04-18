package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.ConfigEmpresa;
import javax.persistence.EntityManager;
import java.util.List;

public class ConfigEmpresaDAO {

    public void salvar(ConfigEmpresa config) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            if (config.getId() == null) {
                em.persist(config);
            } else {
                em.merge(config);
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

    public ConfigEmpresa obterConfiguracao() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            List<ConfigEmpresa> lista = em.createQuery("SELECT c FROM ConfigEmpresa c", ConfigEmpresa.class)
                    .setMaxResults(1)
                    .getResultList();

            if (lista.isEmpty()) {
                return null;
            }
            return lista.get(0);
        } catch (Exception e) {
            return null;
        } finally {
            em.close();
        }
    }
}
