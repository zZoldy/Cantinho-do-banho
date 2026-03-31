/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package com.app.cantinho_banho.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OneToOne;

@Entity
public class Cliente implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false)
    private String nome;
    @Column(nullable = false)
    private String telefone;

    @OneToMany(mappedBy = "dono")
    private List<Pet> pets;

    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "usuario_id", nullable = true)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "pacote_id", nullable = true)
    private Pacote pacoteAtivo;
    
    private Integer sessoesUsadas = 0;
    
    private LocalDate validadePacote;

    public Cliente() {
    }

    // Getters e Setters (Permitem que outras partes do sistema leiam e editem os dados)
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

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public List<Pet> getPets() {
        return pets;
    }

    public void setPets(List<Pet> pets) {
        this.pets = pets;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public Pacote getPacoteAtivo() {
        return pacoteAtivo;
    }

    public void setPacoteAtivo(Pacote pacoteAtivo) {
        this.pacoteAtivo = pacoteAtivo;
    }

    public Integer getSessoesUsadas() {
        return sessoesUsadas;
    }

    public void setSessoesUsadas(Integer sessoesUsadas) {
        this.sessoesUsadas = sessoesUsadas;
    }

    public LocalDate getValidadePacote() {
        return validadePacote;
    }

    public void setValidadePacote(LocalDate validadePacote) {
        this.validadePacote = validadePacote;
    }

}
