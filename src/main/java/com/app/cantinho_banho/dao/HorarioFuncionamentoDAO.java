package com.app.cantinho_banho.dao;

import com.app.cantinho_banho.model.HorarioFuncionamento;
import java.util.List;
import javax.persistence.EntityManager;

public class HorarioFuncionamentoDAO {

    public List<HorarioFuncionamento> listarTodos() {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            List<HorarioFuncionamento> lista = em.createQuery("FROM HorarioFuncionamento ORDER BY diaDaSemana", HorarioFuncionamento.class).getResultList();

            if (lista.isEmpty()) {
                try {
                    em.getTransaction().begin();
                    String[] dias = {"Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"};

                    for (int i = 0; i < 7; i++) {
                        HorarioFuncionamento h = new HorarioFuncionamento();
                        h.setDiaDaSemana(i);
                        h.setNomeDia(dias[i]);
                        h.setAberto(i > 0);
                        h.setHoraAbertura("08:00");
                        h.setHoraFechamento("18:00");

                        em.persist(h);
                        lista.add(h);
                    }
                    em.getTransaction().commit();
                } catch (Exception e) {
                    if (em.getTransaction().isActive()) {
                        em.getTransaction().rollback();
                    }
                    e.printStackTrace();
                }
            }
            return lista;
        } finally {
            em.close();
        }
    }

    public void atualizar(HorarioFuncionamento horario) {
        EntityManager em = JPAUtil.getEntityManager();
        try {
            em.getTransaction().begin();
            em.merge(horario);
            em.getTransaction().commit();
        } catch (Exception e) {
            em.getTransaction().rollback();
            throw e;
        } finally {
            em.close();
        }
    }
}
