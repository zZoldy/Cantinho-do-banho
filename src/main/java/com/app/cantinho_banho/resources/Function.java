package com.app.cantinho_banho.resources;

public class Function {

    /**
     * Verifica se a string inicia com um caractere que não é uma letra.
     *
     * @param texto
     * @return true se o primeiro caractere for número, símbolo ou espaço.
     */
    public static boolean validarInicioNaoLetra(String texto) {
        if (texto == null || texto.trim().isEmpty()) {
            return false;
        }

        // Pega o primeiro caractere após remover espaços inúteis
        char primeiroChar = texto.trim().charAt(0);

        // Retorna TRUE se NÃO for uma letra
        return !Character.isLetter(primeiroChar);
    }
}
