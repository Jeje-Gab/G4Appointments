/**
 * Objeto Paciente retornado pela API G1.
 * Fonte: swagger da API de Pacientes (GET /paciente/{idpaciente}).
 *
 * @typedef {Object} G1Patient
 * @property {number}      idpaciente      - PK gerada automaticamente (inteiro).
 * @property {string}      nome            - Nome completo do paciente.
 * @property {string}      telefone        - Telefone único no sistema.
 * @property {string}      cpf             - CPF único (somente números).
 * @property {string}      data_nascimento - Data no formato YYYY-MM-DD.
 * @property {string}      endereco        - Endereço completo.
 * @property {string|null} foto            - URL da foto ou null se não informada.
 */

/**
 * Resposta de erro do G1 (404, 401, 500).
 *
 * @typedef {Object} G1ErrorResponse
 * @property {string} message - Mensagem descritiva do erro.
 */
