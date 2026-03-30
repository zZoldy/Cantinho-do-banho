package com.app.cantinho_banho.dao;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

public class JPAUtil {
    private static final EntityManagerFactory factory = Persistence.createEntityManagerFactory("CantinhoBanhoPU");

    public static EntityManager getEntityManager(){
        return factory.createEntityManager();
    }
}
