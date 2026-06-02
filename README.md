# 🏊 Piscina Comunitària

Aplicació web per gestionar els controls de qualitat de l'aigua d'una piscina
comunitària: **pH**, **clor lliure** i accions de manteniment (neteja fons).

Construïda amb **Next.js** (App Router) i **Supabase**.

## Funcionalitats

- 🔐 **Accés sense contrasenya** mitjançant enllaç màgic (magic link) per correu.
- 👥 **Dos rols**:
  - **Administrador/a**: registra nous controls (pH, clor, accions) amb data.
  - **Veí/Veïna**: consulta l'històric de controls.
- 📊 **Històric** de controls amb indicació visual dels valors fora de rang.
- 📧 **Alertes per correu** automàtiques a tots els veïns quan un valor està
  fora del rang recomanat.
- 🇨🇦 Interfície íntegrament en **català**.

## Requisits previs

- [Node.js](https://nodejs.org/) 18.18 o superior (recomanat 20+).
- Un compte gratuït a [Supabase](https://supabase.com/).
- (Opcional, per a les alertes) un compte gratuït a [Resend](https://resend.com/).

---

## Posada en marxa

### 1. Instal·la les dependències

```bash
npm install
```

### 2. Crea el projecte a Supabase

1. Entra a [supabase.com](https://supabase.com/) i crea un projecte nou.
2. Quan estigui llest, ve a **Project Settings → API** i apunta:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Crea les taules i les polítiques de seguretat

1. A Supabase, ve a **SQL Editor → New query**.
2. Copia tot el contingut del fitxer [`supabase/schema.sql`](./supabase/schema.sql).
3. Enganxa'l i fes clic a **Run**.

Això crea les taules `profiles` i `controls`, les polítiques de seguretat (RLS)
i un disparador que crea automàticament el perfil de cada usuari nou.

### 4. Configura les variables d'entorn

Copia el fitxer d'exemple i omple els valors:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://EL-TEU-PROJECTE.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=la-teva-clau-anon
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Opcional (alertes per correu)
RESEND_API_KEY=
ALERT_FROM_EMAIL=Piscina Comunitària <onboarding@resend.dev>

# Opcional (notificacions push) — genera-les amb scripts/generate-vapid.mjs
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:el-teu-correu@example.com
```

> A Windows (PowerShell) pots fer servir: `Copy-Item .env.local.example .env.local`

### 5. Configura les URL de redirecció a Supabase

Perquè els enllaços màgics funcionin, ve a **Authentication → URL Configuration**:

- **Site URL**: `http://localhost:3000` (i, en producció, el teu domini real).
- **Redirect URLs**: afegeix `http://localhost:3000/auth/confirm`
  (i `https://el-teu-domini.com/auth/confirm` en producció).

### 6. Arrenca l'aplicació

```bash
npm run dev
```

Obre [http://localhost:3000](http://localhost:3000).

---

## Crear el primer administrador

Tots els usuaris nous són **veïns** per defecte. Per convertir algú en administrador:

1. Demana-li que entri un cop a l'app amb el seu correu (així es crea el seu perfil).
2. A Supabase, ve a **SQL Editor** i executa (canviant l'adreça):

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'admin@exemple.com';
   ```

A partir d'aquí, aquest usuari veurà el botó **«+ Nou control»**.

---

## Alertes per correu (Resend)

Les alertes s'envien quan es registra un control amb el pH o el clor fora de rang.

1. Crea un compte a [resend.com](https://resend.com/) i genera una **API Key**.
2. Posa-la a `RESEND_API_KEY` al fitxer `.env.local`.
3. (Recomanat per a producció) verifica el teu domini a Resend i fes servir una
   adreça remitent del teu domini a `ALERT_FROM_EMAIL`. Per fer proves pots
   utilitzar `onboarding@resend.dev`.

> Si no configures `RESEND_API_KEY`, l'aplicació **funciona igualment**: només
> registra l'avís a la consola del servidor en comptes d'enviar el correu.

---

## Notificacions push al mòbil (Web Push / VAPID)

A més del correu, l'app pot enviar **notificacions push** al navegador o mòbil
quan el pH o el clor surten de rang i als recordatoris automàtics.

1. Genera un parell de claus VAPID (un sol cop):

   ```bash
   node scripts/generate-vapid.mjs
   ```

2. Copia la sortida a `.env.local` (i a Vercel en producció):

   ```env
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_SUBJECT=mailto:el-teu-correu@example.com
   ```

3. Aplica la migració [`supabase/migrations/0006_push_subscriptions.sql`](./supabase/migrations/0006_push_subscriptions.sql)
   (taula on es desen les subscripcions dels navegadors).
4. L'enviament des del servidor fa servir `SUPABASE_SERVICE_ROLE_KEY`: assegura't
   que també està configurada.
5. A l'app, cada usuari activa les notificacions des de la targeta **«🔔
   Notificacions al mòbil»** del tauler (cal acceptar el permís del navegador).

> Si no configures les claus VAPID, l'app **funciona igualment**: només no
> enviarà notificacions push (les alertes per correu segueixen actives).

### Recordatori automàtic

La tasca diària de [`0004_cron_recordatori.sql`](./supabase/migrations/0004_cron_recordatori.sql)
crida `/api/cron/reminder` a les 09:00. Si fa **4 dies o més** que no es
registra cap control, envia un recordatori **per correu i per push** amb una
**frase divertida diferent cada dia** (vegeu [`src/lib/frases.ts`](./src/lib/frases.ts)).

### Rangs recomanats

Definits a [`src/lib/ranges.ts`](./src/lib/ranges.ts) (basats en el RD 742/2013):

| Paràmetre    | Mínim | Màxim |
| ------------ | ----- | ----- |
| pH           | 7,2   | 8,0   |
| Clor lliure  | 0,5   | 2,0 mg/L |

Pots ajustar-los editant aquest fitxer.

---

## Estructura del projecte

```
piscina-comunitaria/
├── middleware.ts              # Refresca la sessió i protegeix rutes privades
├── supabase/
│   └── schema.sql             # Taules + polítiques de seguretat (RLS)
└── src/
    ├── app/
    │   ├── login/             # Pàgina i acció d'inici de sessió (magic link)
    │   ├── auth/confirm/      # Verificació de l'enllaç màgic
    │   ├── dashboard/         # Històric (tothom) i alta de controls (admin)
    │   │   └── nou/           # Formulari de nou control (només admin)
    │   └── error/             # Pàgina d'error d'autenticació
    ├── components/            # Components reutilitzables (botó de sortida…)
    └── lib/
        ├── supabase/          # Clients de Supabase (navegador, servidor, middleware)
        ├── ranges.ts          # Rangs recomanats i validació (correcte/límit/fora)
        ├── estat.ts           # Estat global de la piscina (semàfor verd/groc/vermell)
        ├── frases.ts          # Frases divertides en català per als recordatoris
        ├── push.ts            # Enviament de notificacions web push (VAPID)
        └── email.ts           # Enviament d'alertes i recordatoris (Resend)
```

---

## Desplegament a producció

L'app es desplega fàcilment a [Vercel](https://vercel.com/):

1. Puja el codi a un repositori de Git i importa'l a Vercel.
2. Afegeix les mateixes variables d'entorn (amb `NEXT_PUBLIC_SITE_URL` apuntant
   al domini de producció).
3. Actualitza les **Redirect URLs** a Supabase amb el domini de producció.

---

## Scripts disponibles

| Ordre           | Descripció                          |
| --------------- | ----------------------------------- |
| `npm run dev`   | Servidor de desenvolupament         |
| `npm run build` | Compilació de producció             |
| `npm run start` | Arrenca la versió compilada         |
| `npm run lint`  | Comprovació de codi amb ESLint      |
