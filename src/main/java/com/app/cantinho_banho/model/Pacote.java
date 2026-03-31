package com.app.cantinho_banho.model;

import java.io.Serializable;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;

@Entity
public class Pacote implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nome; 
    
    private Integer quantidadeSessoes; 
    
    private Integer validadeDias; 
    
    private Double valor;

    public Pacote() {
    }

    // ================= GETTERS E SETTERS =================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public Integer getQuantidadeSessoes() {
        return quantidadeSessoes;
    }

    public void setQuantidadeSessoes(Integer quantidadeSessoes) {
        this.quantidadeSessoes = quantidadeSessoes;
    }

    public Integer getValidadeDias() {
        return validadeDias;
    }

    public void setValidadeDias(Integer validadeDias) {
        this.validadeDias = validadeDias;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }
}