// Exemplo executável de como um módulo externo consome a API externa do G4.
// Representa o backend de um grupo consumidor (ex.: G10 - Faturamento).
//
// Zero dependências: usa o `fetch` nativo do Node (>= 18) e um mini-loader de .env.
//
// Uso:
//   1. cp ../.env.example ../.env   (e preencha API_KEY)
//   2. npm start                    (a partir da pasta external/)
//      ou: node examples/consume.js

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

// ---- mini carregador de .env (sem dependências) ----
function loadEnv(path) {
  let text;
  try {
    text = readFileSync(path, 'utf8');
  } catch {
    return; // sem .env: seguimos com process.env / defaults
  }
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadEnv(join(here, '..', '.env'));

const API_BASE_URL = (process.env.API_BASE_URL || 'http://localhost:3000').replace(/\/$/, '');
const API_KEY = process.env.API_KEY || '';
const PATIENT_ID = process.env.PATIENT_ID || 'p1';

if (!API_KEY || API_KEY === 'cole_sua_chave_aqui') {
  console.error('✖ Defina API_KEY no arquivo external/.env (gere a chave no G4: Admin -> API Keys).');
  process.exit(1);
}

// Cliente mínimo: injeta a API Key em todas as chamadas e trata o envelope.
async function callExternal(path) {
  const res = await fetch(`${API_BASE_URL}/external/v1${path}`, {
    headers: {
      // Os dois formatos são aceitos; use UM deles.
      Authorization: `ApiKey ${API_KEY}`,
      // 'X-API-Key': API_KEY,
      Accept: 'application/json',
    },
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = body?.message || `HTTP ${res.status}`;
    throw new Error(`[${res.status}] ${msg} (code: ${body?.code || '-'})`);
  }
  return body.data;
}

async function main() {
  console.log(`→ G4 externo em ${API_BASE_URL}/external/v1`);
  console.log(`→ usando chave: ${API_KEY.slice(0, 12)}…\n`);

  // 1) Histórico de consultas realizadas do paciente (caso de uso principal).
  console.log(`1) GET /patients/${PATIENT_ID}/consultations/history`);
  const history = await callExternal(`/patients/${PATIENT_ID}/consultations/history`);
  console.log(`   paciente=${history.patientId} total=${history.total}`);
  for (const c of history.consultations) {
    console.log(`   • ${c.specialty} com ${c.doctorName} em ${c.scheduledAt} [${c.status}]`);
  }

  // 2) Listagem com filtro por status.
  console.log('\n2) GET /consultations?status=completed');
  const completed = await callExternal('/consultations?status=completed');
  console.log(`   ${completed.length} consulta(s) realizada(s) no total`);

  // 3) Busca por ID (usa a primeira do histórico, se houver).
  const sample = history.consultations[0];
  if (sample) {
    console.log(`\n3) GET /consultations/${sample.id}`);
    const one = await callExternal(`/consultations/${sample.id}`);
    console.log(`   ok -> ${one.id} (${one.status})`);
  } else {
    console.log('\n3) (sem consulta realizada para buscar por ID — pule ou conclua uma consulta no G4)');
  }

  console.log('\n✔ Concluído.');
}

main().catch((err) => {
  console.error(`\n✖ Falha ao consumir a API: ${err.message}`);
  process.exit(1);
});
