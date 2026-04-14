package com.app.cantinho_banho.model;

import java.io.Serializable;
import java.time.LocalDateTime;
import javax.persistence.Id;
import javax.persistence.Entity;
import javax.persistence.Table;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.OneToOne;
import javax.persistence.JoinColumn;
import javax.persistence.Column;

//import javax.persistence
@Entity
@Table
public class Estoque implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "produto_id", nullable = false, unique = true)
    private Produto produto;

    @Column(nullable = false)
    private Integer quantidadeAtual = 0;

    @Column(nullable = false)
    private Integer quantidadeMinima = 5;

    private LocalDateTime dataUltimaReposicao;

    public Estoque() {

    }

    public Long getId() {
        return id;
    }

    public Produto getProduto() {
        return produto;
    }

    public void setProduto(Produto produto) {
        this.produto = produto;
    }

    public Integer getQuantidadeAtual() {
        return quantidadeAtual;
    }

    public void setQuantidadeAtual(Integer quantidadeAtual) {
        this.quantidadeAtual = quantidadeAtual;
    }

    public Integer getQuantidadeMinima() {
        return quantidadeMinima;
    }

    public void setQuantidadeMinima(Integer quantidadeMinima) {
        this.quantidadeMinima = quantidadeMinima;
    }

    public LocalDateTime getDataUltimaReposicao() {
        return dataUltimaReposicao;
    }

    public void setDataUltimaReposicao(LocalDateTime dataUltimaReposicao) {
        this.dataUltimaReposicao = dataUltimaReposicao;
    }
}
