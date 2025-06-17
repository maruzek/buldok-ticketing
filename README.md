# Buldok Ticketing

Jednoduchý ticketing systém pro místní fotbalový klub, který slouží jako náhrada za "tužku, papír a šatnové bločky". Front end aplikace je napsaná v Reactu a back end v Symfony.

Nápad na tuto aplikaci mě napadl už pár let před jejím stvořením. Na jednom víkendovém domácím zápase karlovarského fotbalového klubu TJ Karlovy Vary-Dvory (neboli Buldoci) jsem musel zaskočit za svou sestru při vybírání vstupného. Po zjištění, že vstupenky se prodávají pomocí papírových šatnových bločků a zaznamenávají se jednoduše na kus papíru, mě napadlo, že by bylo možné celý proces zefektivnit, digitalizovat, ulehčit tak práci lidem, kteří vstupenky takovýmto způsobem prodávají a zajistit možnost sledování podrobných statistik z prodejů.

Více informací o projektu naleznete v [mém portfoliu zde](https://martinruzek.cz/projects/buldok-ticketing/).

## Cíle

Cílem bylo vytvořit jednoduchý webový nástroj, který by umožnil:

- rychlejší a jednoduchý prodej vstupenek na mobilním zařízení pokladního,
- přehledné sledování tržeb a návštěvnosti,
- omamžité vyhodnocení prodejů ihned po jeho ukončení

## Budoucnost

Momentálně projekt prošel prvním testováním a vše zatím naznačuje tomu, že se aplikace od příští sezóny bude používat na všech zápasech Buldoků. Před plným nasazením od srpna se bude muset doladit několik maličkostí, ale jako koncept aplikace uspěla a byla uvítána jako pozitivní vylepšení fungování klubu.

### Tech stack

#### Front end

- TypeScript,
- React 19,
- Tailwind
- Recharts
- React Router
- Vite,
- ESLint, Prettier,
- pnpm

#### Back end

- PHP 8.2,
- Symfony 7,
- MariaDB,
- Symfony Flex,
- Composer,
- Apache

#### Security

- JWT (LexikJWT)

#### Prostředí

- Docker,
- Docker Compose,
- Git,
- GitHub

#### Deploy

- Wedos NoLimit hosting

## TODO

- [ ] Přidat refresh tokeny
- [ ] Zvýšit standardy zabezpečení (délka hesla, komplexita hesla, atd.)
- [ ] Přidat kartu sezony a celkově přehlednější správu sezón
- [ ] Zlepšit upozornění na události v aplikaci
- [ ] Standardizovat API responses
- [ ] Zvýšit konzistenci error resposes
- [ ] Nahradit logiku v kontrolerech použitím services
- [ ] Zavést používání DTOs
- [ ] Používat EntityValueResolver
- [ ] Zlepšit konzistenci kódu (použít stejné naming konvence)
- [ ] Přidat Unit testy
- [ ] Vytvořit API dokumentaci
- [ ] Přidat fuknci záznamu prvního lístku ze šatnového bločku
- [ ] Přejít na React Query
- [ ] Přejít na Shadcn UI
