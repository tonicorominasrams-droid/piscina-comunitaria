/**
 * Frases divertides en català per quan la piscina està en perfecte estat
 * (semàfor verd). Conviden els veïns a banyar-se i feliciten pel bon manteniment.
 */
export const FRASES_VERD: readonly string[] = [
  "L'aigua és perfecta, llanceu-vos! 🏊‍♂️",
  "La piscina està en forma, i vosaltres? 💪",
  "Valors immaculats! L'únic que falta ara sou vosaltres. 🩱",
  "pH i clor perfectes: la piscina és vostra, veïns! 🌊",
  "Avui és dia de piscina. L'aigua ho confirma, els números ho diuen. ✅",
  "La química és perfecta. Ara falta l'alegria dels veïns! 🎉",
  "Tot a punt! L'aigua ja té ganes que us hi tireu. 💧",
  "Control superat amb nota. La piscina mereix ser gaudida! 🌟",
  "Gràcies al vostre esforç, l'água és cristal·lina. Aprofiteu-la! 💎",
  "L'estiu crema i l'água fresca us espera. A refrescar-se! 🌞",
  "Missió acomplerta: piscina en perfecte estat. Ara a gaudir! 🎯",
  "Els veïns d'aquest bloc saben mantenir una piscina. Ara a nedar! 🥇",
  "Ni les algues s'hi atreveixen avui. L'água és tota vostra. 🦠🚫",
  "Control perfecte! Porteu les tovalloles, que l'água és ideal. 🏖️",
  "La piscina us dóna la benvinguda: valors correctes i portes obertes. 🚪",
  "El pH somriu, el clor aplaudeix. Saltem! 🤸",
  "Avui la piscina és una bassa d'oli... però del bo! 🫧",
  "Aigua cristal·lina, veïns contents. Així s'estima una piscina! 💙",
  "Bocins de cel blau i piscina a punt. Quin dia per banyar-se! ☀️",
  "La piscina us vol dir gràcies. Vosaltres, porteu-li companyia! 🙏",
];

/** Tria una frase aleatòria per al semàfor verd. */
export function fraseVerda(): string {
  const i = Math.floor(Math.random() * FRASES_VERD.length);
  return FRASES_VERD[i];
}

/**
 * Frases divertides i originals en català per animar a fer el control de la
 * piscina. S'utilitzen als recordatoris automàtics (correu i notificació
 * push) i se'n tria una a l'atzar cada vegada.
 */
export const FRASES_RECORDATORI: readonly string[] = [
  "La piscina t'ha enviat una indirecta: fa dies que no la mires. 👀",
  "El clor s'avorreix sol. Vine a fer-li companyia amb un control! 🧪",
  "Si l'aigua pogués parlar, et diria: «ei, que estic aquí!». 💧",
  "Les algues estan fent plans per quedar-s'hi. No els ho posis fàcil! 🦠",
  "El pH ha demanat hora amb tu. No el deixis plantat. ⏰",
  "Una piscina sense control és com un cafè sense sucre: alguna cosa falla. ☕",
  "Avui fa un dia perfecte per ser l'heroi de la piscina. 🦸",
  "La teva piscina mereix una mica d'amor (i una tira reactiva). 💙",
  "Els mosquits ja estan fent cua. Tanca'ls la porta amb un bon control! 🦟",
  "Spoiler: l'aigua verda no està de moda aquesta temporada. 🟢🚫",
  "Fes-li un selfie a la piscina... vull dir, un control. 📸",
  "El clor i el pH t'esperen com dos amics fidels. No els facis esperar més. 🤝",
  "Recorda: una piscina feliç és una piscina controlada. 😊",
  "Han passat uns quants dies. La piscina comença a sospitar que l'has oblidada. 🥺",
  "Dedica-li dos minuts a la piscina i ella te'n tornarà hores de bany. 🏊",
  "Avui toca jugar a químics: agafa la tira i mesura! 🔬",
  "L'aigua cristal·lina no creix als arbres. Cal cuidar-la! 🌳",
  "Que no t'agafi el toro... ni les algues. Fes el control avui! 🐂",
  "Un petit control per a tu, un gran pas per a la piscina. 🚀",
  "La piscina ha trucat tres cops. Que potser no hi ets? ☎️",
  "Posa-hi cinc minuts ara i estalvia't un ensurt verd demà. ✋",
  "El termòmetre puja i les ganes de banyar-s'hi també. Comprovem que tot està a punt? 🌡️",
  "Si la piscina tingués Instagram, ja t'hauria etiquetat: «vine a veure'm». 📱",
  "No deixis que el clor baixi la guàrdia. Revisa'l avui mateix! 🛡️",
];

/** Tria una frase a l'atzar de la llista de recordatoris. */
export function fraseAleatoria(): string {
  const i = Math.floor(Math.random() * FRASES_RECORDATORI.length);
  return FRASES_RECORDATORI[i];
}
