package com.app.cantinho_banho.model;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalTime;
import javax.persistence.CascadeType;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;

@Entity
public class Agendamento implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "pet_id")
    private Pet pet;

    @ManyToOne
    @JoinColumn(name = "funcionario_id")
    private Funcionario funcionario;

    @ManyToOne
    @JoinColumn(name = "servico_id")
    private Servico servico;

    @Column(nullable = false)
    private String status; // "Pendente", "Confirmado"

    @Column(nullable = false)
    private LocalDate data; // YYYY-MM-DD

    @Column(nullable = false)
    private LocalTime hora; // HH:MM:SS

    private String statusPagamento; // "Pendente", "Confirmado"

    private double valor;

    private String formPagamento;

    private LocalTime entrada_pet; // HH:MM:SS

    private LocalTime saida_pet; // HH:MM:SS

    private String obs;

    public Agendamento() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public Cliente getDono() {
        return this.getPet().getDono();
    }

    public String getNomeDono() {
        if (getPet() == null || getPet().getDono() == null) {
            return "Dados do cliente indisponíveis";
        }
        return this.getPet().getDono().getNome();
    }

    public Servico getServico() {
        return servico;
    }

    public void setServico(Servico servico) {
        this.servico = servico;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public LocalTime getHora() {
        return hora;
    }

    public void setHora(LocalTime hora) {
        this.hora = hora;
    }

    public Funcionario getFuncionario() {
        return funcionario;
    }

    public void setFuncionario(Funcionario funcionario) {
        this.funcionario = funcionario;
    }

    public double getValor() {
        return valor;
    }

    public void setValor(double valor) {
        this.valor = valor;
    }

    public String getFormPagamento() {
        return formPagamento;
    }

    public void setFormPagamento(String formPagamento) {
        this.formPagamento = formPagamento;
    }

    public LocalTime getEntrada_pet() {
        return entrada_pet;
    }

    public void setEntrada_pet(LocalTime entrada_pet) {
        this.entrada_pet = entrada_pet;
    }

    public LocalTime getSaida_pet() {
        return saida_pet;
    }

    public void setSaida_pet(LocalTime saida_pet) {
        this.saida_pet = saida_pet;
    }

    public String getObs() {
        return obs;
    }

    public void setObs(String obs) {
        this.obs = obs;
    }

    public String getStatusPagamento() {
        return statusPagamento;
    }

    public void setStatusPagamento(String statusPagamento) {
        this.statusPagamento = statusPagamento;
    }

}
