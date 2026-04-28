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

        char primeiroChar = texto.trim().charAt(0);

        return !Character.isLetter(primeiroChar);
    }

    public static boolean isInicioBarraInvertida(String texto) {
        if (texto == null) {
            return false;
        }

        // O trim() remove espaços em branco antes de checar a barra
        String limpo = texto.trim();

        return !limpo.isEmpty() && limpo.startsWith("\\");
    }
}
