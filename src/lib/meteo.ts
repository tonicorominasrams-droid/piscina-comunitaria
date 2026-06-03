/**
 * Dades meteorològiques de la piscina (Castellar del Vallès).
 *
 * Fem servir l'API gratuïta i sense clau d'Open-Meteo per obtenir la
 * temperatura actual i el codi de condició meteorològica (estàndard WMO).
 */

/** Coordenades de Castellar del Vallès. */
export const LATITUD = 41.6089;
export const LONGITUD = 2.0875;

export type Meteo = {
  /** Temperatura actual en graus Celsius. */
  temperatura: number;
  /** Codi de condició meteorològica WMO. */
  codi: number;
};

/**
 * Obté la meteorologia actual de Castellar del Vallès des d'Open-Meteo.
 * Retorna null si hi ha qualsevol error (la funció mai llança excepcions
 * perquè el registre del control no ha de fallar si el temps no es pot llegir).
 */
export async function obteMeteoActual(): Promise<Meteo | null> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${LATITUD}` +
    `&longitude=${LONGITUD}&current=temperature_2m,weather_code`;

  try {
    const res = await fetch(url, {
      // No cal cachejar gaire estona: el temps canvia.
      next: { revalidate: 900 },
    });
    if (!res.ok) return null;

    const data = await res.json();
    const temperatura = data?.current?.temperature_2m;
    const codi = data?.current?.weather_code;

    if (typeof temperatura !== "number" || typeof codi !== "number") {
      return null;
    }

    return { temperatura, codi };
  } catch {
    return null;
  }
}

export type DescripcioMeteo = {
  icona: string;
  etiqueta: string;
  /** True si és un dia assolellat o poc ennuvolat (bon temps per a la piscina). */
  bonTemps: boolean;
};

/**
 * Tradueix un codi WMO a una icona, una etiqueta en català i si fa bon temps.
 * Referència de codis: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
 */
export function descriuMeteo(codi: number | null): DescripcioMeteo {
  if (codi === null) {
    return { icona: "❓", etiqueta: "Desconegut", bonTemps: false };
  }

  switch (true) {
    case codi === 0:
      return { icona: "☀️", etiqueta: "Cel serè", bonTemps: true };
    case codi === 1:
      return { icona: "🌤️", etiqueta: "Majoritàriament serè", bonTemps: true };
    case codi === 2:
      return { icona: "⛅", etiqueta: "Parcialment ennuvolat", bonTemps: true };
    case codi === 3:
      return { icona: "☁️", etiqueta: "Ennuvolat", bonTemps: false };
    case codi === 45 || codi === 48:
      return { icona: "🌫️", etiqueta: "Boira", bonTemps: false };
    case codi >= 51 && codi <= 57:
      return { icona: "🌦️", etiqueta: "Plugim", bonTemps: false };
    case codi >= 61 && codi <= 67:
      return { icona: "🌧️", etiqueta: "Pluja", bonTemps: false };
    case codi >= 71 && codi <= 77:
      return { icona: "🌨️", etiqueta: "Neu", bonTemps: false };
    case codi >= 80 && codi <= 82:
      return { icona: "🌧️", etiqueta: "Ruixats", bonTemps: false };
    case codi === 85 || codi === 86:
      return { icona: "🌨️", etiqueta: "Ruixats de neu", bonTemps: false };
    case codi >= 95 && codi <= 99:
      return { icona: "⛈️", etiqueta: "Tempesta", bonTemps: false };
    default:
      return { icona: "🌡️", etiqueta: "Variable", bonTemps: false };
  }
}

export type Recomanacio = {
  /** Missatge en català per a l'usuari. */
  missatge: string;
  /** Nivell d'urgència, per donar-li color a la targeta. */
  to: "bo" | "avis" | "urgent";
};

/**
 * Genera la recomanació sobre el proper control, COHERENT amb el semàfor.
 *
 * La recomanació es deriva del MATEIX estat que el semàfor (mateix color i el
 * mateix motiu), de manera que mai es contradiuen: si el semàfor és vermell, la
 * recomanació és urgent; si és verd, no demana res urgent. La meteorologia
 * només afegeix context (si és bon moment o no per sortir a fer la revisió).
 *
 * @param ultimControl Data de l'últim control (null si no n'hi ha cap).
 * @param meteo        Meteorologia actual (null si no s'ha pogut obtenir).
 * @param estat        Estat (semàfor) ja calculat de la piscina.
 */
export function recomanacioProperControl(
  ultimControl: Date | null,
  meteo: Meteo | null,
  estat: { color: "verd" | "groc" | "vermell"; foraDeRang: boolean },
): Recomanacio {
  const desc = meteo ? descriuMeteo(meteo.codi) : null;
  const fragmentTemps = meteo
    ? `avui ${desc!.bonTemps ? "fa bon temps" : "fa mal temps"} (${desc!.etiqueta.toLowerCase()}, ${Math.round(meteo.temperatura)} °C)`
    : null;
  const fapBonTemps = desc?.bonTemps ?? false;

  if (!ultimControl) {
    return {
      missatge: meteo
        ? `Encara no hi ha cap control registrat i ${fragmentTemps}. Comença avui mateix amb la primera revisió!`
        : "Encara no hi ha cap control registrat. Comença avui mateix amb la primera revisió!",
      to: "urgent",
    };
  }

  // 🔴 Vermell: valors fora de rang o fa massa dies de la revisió.
  if (estat.color === "vermell") {
    if (estat.foraDeRang) {
      return {
        missatge:
          "Els valors de l'última lectura estan fora de rang. Corregeix l'aigua i torna a mesurar com abans millor.",
        to: "urgent",
      };
    }
    return {
      missatge: meteo
        ? `Fa massa dies de l'últim control. ${capitalitza(fragmentTemps!)}; fes la revisió com abans millor.`
        : "Fa massa dies de l'últim control. Fes la revisió com abans millor.",
      to: "urgent",
    };
  }

  // 🟡 Groc: comença a fer dies o algun valor a tocar del límit.
  if (estat.color === "groc") {
    return {
      missatge: meteo
        ? `Convé fer una ullada aviat. ${capitalitza(fragmentTemps!)}${fapBonTemps ? ", és un bon moment per revisar-ho." : "."}`
        : "Convé fer una ullada a la piscina aviat.",
      to: "avis",
    };
  }

  // 🟢 Verd: tot al dia. La meteo només suggereix si vols avançar la revisió.
  if (fapBonTemps) {
    return {
      missatge: `Tot està al dia i ${fragmentTemps}. Si vols, pots aprofitar per fer una ullada.`,
      to: "bo",
    };
  }
  return {
    missatge: meteo
      ? `Tot està al dia i ${fragmentTemps}. No cal fer res de moment.`
      : "Tot està al dia. No cal fer res de moment.",
    to: "bo",
  };
}

function capitalitza(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
