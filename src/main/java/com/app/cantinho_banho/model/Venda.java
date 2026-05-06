package com.app.cantinho_banho.model;

import java.io.Serializable;
import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendas") // O Hibernate vai criar a tabela "vendas"
public class Venda implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "produto_id", nullable = false)
    private Produto produto;

    @Column(nullable = false)
    private int quantidade;

    @Column(name = "valor_total", nullable = false)
    private Double valorTotal;

    @Column(name = "cliente_nome")
    private String clienteNome;

    @Column(name = "forma_pagamento")
    private String formaPagamento;

    @Column(name = "data_venda")
    private LocalDateTime dataVenda;

    @Column(name = "nf_emitida", columnDefinition = "boolean default false")
    private boolean nfEmitida = false;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public int getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(int quantidade) {
        this.quantidade = quantidade;
    }

    public Double getValorTotal() {
        return valorTotal;
    }

    public void setValorTotal(Double valorTotal) {
        this.valorTotal = valorTotal;
    }

    public String getClienteNome() {
        return clienteNome;
    }

    public void setClienteNome(String clienteNome) {
        this.clienteNome = clienteNome;
    }

    public String getFormaPagamento() {
        return formaPagamento;
    }

    public void setFormaPagamento(String formaPagamento) {
        this.formaPagamento = formaPagamento;
    }

    public LocalDateTime getDataVenda() {
        return dataVenda;
    }

    public void setDataVenda(LocalDateTime dataVenda) {
        this.dataVenda = dataVenda;
    }

    public boolean isNfEmitida() {
        return nfEmitida;
    }

    public void setNfEmitida(boolean nfEmitida) {
        this.nfEmitida = nfEmitida;
    }
}
