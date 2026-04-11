package com.app.cantinho_banho.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendas_pacotes")
public class VendaPacote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;

    @ManyToOne
    @JoinColumn(name = "pacote_id", nullable = false)
    private Pacote pacote;

    private LocalDateTime dataVenda;
    private Double valorPago;
    private String formaPagamento;
    private Integer sessoesRestantes;

    public Long getId() {
        return id;
    }

    public Cliente getCliente() {
        return cliente;
    }

    public void setCliente(Cliente cliente) {
        this.cliente = cliente;
    }

    public Pacote getPacote() {
        return pacote;
    }

    public void setPacote(Pacote pacote) {
        this.pacote = pacote;
    }

    public LocalDateTime getDataVenda() {
        return dataVenda;
    }

    public void setDataVenda(LocalDateTime dataVenda) {
        this.dataVenda = dataVenda;
    }

    public Double getValorPago() {
        return valorPago;
    }

    public void setValorPago(Double valorPago) {
        this.valorPago = valorPago;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public Integer getSessoesRestantes() {
        return sessoesRestantes;
    }

    public void setSessoesRestantes(Integer sessoesRestantes) {
        this.sessoesRestantes = sessoesRestantes;
    }


}