/*
 * Format :
 * { date: 15, prix: 650, nom: "Loyer" }
 *
 * Règles :
 * - Jour avant aujourd'hui : déjà payé.
 * - Jour égal ou supérieur à aujourd'hui : reste à payer.
 * - Les jours supérieurs au dernier jour du mois sont ignorés.
 */

const depenses = [
  { date: 1, prix: 200, nom: "Virement Compte Joint" },
  { date: 1, prix: 6.99, nom: "Disney+" },
  { date: 1, prix: 1.00, nom: "Assurance Perte/Vol" },
  { date: 2, prix: 2.84, nom: "Assu. CAAE" },
  { date: 3, prix: 63.65, nom: "Assurance Voiture" },
  { date: 5, prix: 11.00, nom: "TCL" },
  { date: 14, prix: 3.00, nom: "Banque" },
  { date: 20, prix: 2.99, nom: "Icloud" },
  { date: 25, prix: 5.99, nom: "Itunes" },
  { date: 25, prix: 34.99, nom: "Basic Fit" }
];

const balanceInput = document.querySelector("#current-balance");
const monthEndBalance = document.querySelector("#month-end-balance");
const resultDetail = document.querySelector("#result-detail");
const monthLabel = document.querySelector("#month-label");

const paidList = document.querySelector("#paid-list");
const dueList = document.querySelector("#due-list");
const paidTotal = document.querySelector("#paid-total");
const dueTotal = document.querySelector("#due-total");
const paidEmpty = document.querySelector("#paid-empty");
const dueEmpty = document.querySelector("#due-empty");

const moneyFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR"
});

// Affiche une liste de dépenses.
function afficherListe(element, liste) {
  element.replaceChildren();

  liste.forEach((depense) => {
    const item = document.createElement("li");
    item.className = "expense-item";

    const description = document.createElement("div");

    const name = document.createElement("span");
    name.className = "expense-name";

    const dateComplete = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        depense.date
    );

    const dateFormatee = dateComplete.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit"
    });

    name.textContent = `${depense.nom || "Dépense"} - ${dateFormatee}`;

    const price = document.createElement("span");
    price.className = "expense-price";
    price.textContent = moneyFormatter.format(depense.prix);

    description.append(name);
    item.append(description, price);
    element.append(item);
  });
}

// Affiche ou masque le message lorsqu'une liste est vide.
function afficherEtatVide(element, liste) {
  element.classList.toggle("visible", liste.length === 0);
}

function calculerBudget() {
  const maintenant = new Date();

  const jourActuel = maintenant.getDate();

  const dernierJourDuMois = new Date(
    maintenant.getFullYear(),
    maintenant.getMonth() + 1,
    0
  ).getDate();

  // Affiche le mois en cours.
  if (monthLabel) {
    monthLabel.textContent = maintenant.toLocaleDateString(
        "fr-FR",
        {
        month: "long",
        year: "numeric"
        }
    );
    }

  // Garde uniquement les dépenses valides du mois.
  const depensesDuMois = depenses
    .filter((depense) => {
      return (
        Number.isInteger(depense.date) &&
        depense.date >= 1 &&
        depense.date <= dernierJourDuMois &&
        Number.isFinite(Number(depense.prix)) &&
        Number(depense.prix) >= 0
      );
    })
    .slice()
    .sort((a, b) => a.date - b.date);

  // Dépenses déjà payées : jours précédents.
  const dejaPayees = depensesDuMois.filter(
    (depense) => depense.date < jourActuel
  );

  // Dépenses à payer : aujourd'hui jusqu'à la fin du mois.
  const aPayer = depensesDuMois.filter(
    (depense) => depense.date >= jourActuel
  );

  // Calcule les totaux.
  const totalPaye = dejaPayees.reduce(
    (total, depense) => total + Number(depense.prix),
    0
  );

  const totalAPayer = aPayer.reduce(
    (total, depense) => total + Number(depense.prix),
    0
  );

  // Met à jour les deux colonnes.
  afficherListe(paidList, dejaPayees);
  afficherListe(dueList, aPayer);

  afficherEtatVide(paidEmpty, dejaPayees);
  afficherEtatVide(dueEmpty, aPayer);

  paidTotal.textContent = moneyFormatter.format(totalPaye);
  dueTotal.textContent = moneyFormatter.format(totalAPayer);

  // Récupère le solde saisi.
  const valeurSaisie = balanceInput.value.trim();

  if (valeurSaisie === "") {
    monthEndBalance.textContent = "—";
    monthEndBalance.classList.remove("negative");

    resultDetail.textContent =
      "Entre ton solde pour afficher le résultat.";

    return;
  }

  const soldeActuel = Number(valeurSaisie);

  if (!Number.isFinite(soldeActuel)) {
    monthEndBalance.textContent = "—";
    monthEndBalance.classList.remove("negative");

    resultDetail.textContent = "Saisis un montant valide.";

    return;
  }

  // Solde final = solde actuel - dépenses restant à payer.
  const reste = soldeActuel - totalAPayer;

  monthEndBalance.textContent = moneyFormatter.format(reste);
  monthEndBalance.classList.toggle("negative", reste < 0);

  resultDetail.textContent =
    `${moneyFormatter.format(soldeActuel)} aujourd'hui − ` +
    `${moneyFormatter.format(totalAPayer)} à payer`;
}

// Recalcule automatiquement à chaque modification du solde.
balanceInput.addEventListener("input", calculerBudget);

// Premier affichage au chargement de la page.
calculerBudget();
