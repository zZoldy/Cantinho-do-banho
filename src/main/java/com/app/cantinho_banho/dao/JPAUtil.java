/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.app.cantinho_banho.dao;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.Persistence;

/**
 *
 * @author Z D K
 */
public class JPAUtil {
    private static final EntityManagerFactory factory = Persistence.createEntityManagerFactory("CantinhoBanhoPU");

    public static EntityManager getEntityManager(){
        return factory.createEntityManager();
    }
}
