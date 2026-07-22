import React, { useState, useEffect } from 'react';
import api from '../api/axios';

// --- Pest Image Imports ---
import fallArmywormImg from '../assets/fall_armyworm_real.png';
import stemBorerImg from '../assets/stem_borer.png';
import aphidsImg from '../assets/aphids.png';
import whiteflyImg from '../assets/whitefly.png';
import thripsImg from '../assets/thrips.png';
import spiderMiteImg from '../assets/spider_mite.png';
import mealybugImg from '../assets/mealybug.png';
import cutwormImg from '../assets/cutworm.png';

// --- Weed Image Imports ---
import strigaImg from '../assets/striga.png';
import blackjackImg from '../assets/blackjack.png';
import couchgrassImg from '../assets/couchgrass.png';

/* ================================================================
   COMPREHENSIVE PEST ENCYCLOPEDIA DATA
   Covers: crops attacked, movement patterns, signs, treatments
   ================================================================ */
const PEST_ENCYCLOPEDIA = [
  {
    id: 'fall-armyworm',
    name: 'Fall Armyworm',
    scientific: 'Spodoptera frugiperda',
    category: 'Lepidoptera (Moths & Caterpillars)',
    image: fallArmywormImg,
    riskLevel: 'High',
    origin: 'Invasive — Americas. First detected Kenya 2017.',
    cropsAttacked: ['Maize', 'Wheat', 'Sorghum', 'Millet', 'Rice', 'Sugarcane', 'Cotton', 'Vegetables'],
    movementPattern: 'Adults (moths) migrate long distances on wind currents at night — up to 100km per night. Females lay egg masses (100–200 eggs) on upper leaf surfaces in young maize. Larvae hatch in 2–4 days and move down into the whorl. Larvae are gregarious at early instars; older larvae are cannibalistic and solitary.',
    lifecycle: 'Egg (2-4 days) → Larva (14-21 days, 6 instars) → Pupa in soil (8-9 days) → Adult moth (10-14 days). 3-4 generations per year in Kenya.',
    signs: [
      'Pinholes and transparent windows on young leaves (1st-2nd instar feeding)',
      'Ragged, irregular holes on leaves (older larvae)',
      'Wet frass (sawdust-like droppings) in the whorl — a key identifier',
      'Distinctive inverted Y mark on larva head capsule',
      'Leaf whorl filled with feeding debris',
      'Severe: plants stripped to stalk, premature tasseling',
      'Entry holes into maize ear, contaminated with frass'
    ],
    treatment: {
      biological: ['Neem Oil Extract (Azadirachtin) 5L/ha — apply on young larvae', 'Bacillus thuringiensis (Bt) spray — KALRO approved biocontrol', 'SpinTor® 120SC (Spinosad) 125ml/ha — derived from soil bacterium', 'Trichogramma spp. egg parasitoids — KALRO bio-control programme'],
      chemical: ['Coragen® 20SC (Chlorantraniliprole) 150-200ml/ha — PCPB Reg.', 'Belt® 480SC (Flubendiamide) 125ml/ha — PCPB Reg.', 'Emmaban® EC (Emamectin Benzoate) 300ml/ha', 'Karate® 5EC (Lambda-cyhalothrin) 200ml/ha'],
      cultural: ['Early planting (avoid peak moth emergence)', 'Intercropping with Push-Pull (Desmodium + Napier)', 'Scout fields twice weekly from crop emergence', 'Use pheromone traps to monitor adult populations']
    }
  },
  {
    id: 'stem-borer',
    name: 'Stem Borer',
    scientific: 'Busseola fusca / Chilo partellus',
    category: 'Lepidoptera (Moths & Caterpillars)',
    image: stemBorerImg,
    riskLevel: 'High',
    origin: 'Native to Africa. B. fusca (African stem borer), C. partellus (Spotted stem borer, invasive from Asia).',
    cropsAttacked: ['Maize', 'Sorghum', 'Millet', 'Wheat', 'Sugarcane', 'Rice'],
    movementPattern: 'Moths are nocturnal, attracted to light. Females lay egg batches (50-100) on lower leaf surfaces near midrib. Newly hatched larvae are dispersed by wind. Larvae feed on leaves first, then bore into the whorl and down the stem. Older larvae tunnel through the stalk, moving downwards toward the roots.',
    lifecycle: 'Egg (5-7 days) → Larva (20-30 days) → Pupa in stem/soil (10-14 days) → Adult (7-14 days). 2-3 generations per year.',
    signs: [
      '"Dead heart" — central shoot wilts and dies while outer leaves remain green (key sign)',
      'Tiny windowing holes on leaves from early larval feeding',
      '"Window pane" effect — transparent leaf patches where larvae scraped tissue',
      'Entry holes on stem, surrounded by frass',
      'Tunnelling visible in cross-section of stalk',
      'Lodging (stem breakage) in mature crop',
      'Reduced grain fill due to stem damage blocking nutrient flow'
    ],
    treatment: {
      biological: ['Trichogramma spp. egg parasitic wasps — 200,000 parasitoids/ha (KALRO)', 'METARHIZA® WP (Metarhizium anisopliae) 1kg/ha — entomopathogenic fungus', 'Cotesia sesamiae parasitic wasp — naturally occurring biocontrol'],
      chemical: ['Furadan 3G® (Carbofuran granules) 10kg/ha into whorl — PCPB Reg.', 'Fastac® 10EC (Alpha-cypermethrin) 200ml/ha', 'Dipterex 97WP (Trichlorfon) — whorl application', 'Dimethoate 40EC 500ml/ha'],
      cultural: ['Push-Pull: Intercrop with Desmodium (pull) + Napier border grass (push)', 'Early planting to escape peak borer generation', 'Destroy crop residues after harvest', 'Avoid late planting in high-rainfall areas']
    }
  },
  {
    id: 'aphids',
    name: 'Aphids (Greenfly/Blackfly)',
    scientific: 'Myzus persicae / Aphis gossypii / Rhopalosiphum maidis',
    category: 'Hemiptera (True Bugs)',
    image: aphidsImg,
    riskLevel: 'Medium',
    origin: 'Cosmopolitan — multiple species native and invasive.',
    cropsAttacked: ['Vegetables (Kale, Cabbage, Spinach)', 'Maize (Corn leaf aphid)', 'Beans', 'Potatoes', 'Tomatoes', 'Peppers', 'Wheat', 'Soybeans', 'Horticultural crops'],
    movementPattern: 'Wingless forms (apterae) colonize plants and reproduce by parthenogenesis (cloning) — populations can double every 2-3 days. Winged forms (alatae) develop when colony is crowded or plant quality declines — they fly to new host plants. Ants actively farm aphids for honeydew, carrying them to new plants and protecting them from predators.',
    lifecycle: 'Live birth in warm conditions (no eggs). Wingless: 7-10 days to adult. Winged forms produced every 3-5 generations. Can complete 20+ generations per season.',
    signs: [
      'Curled, cupped or distorted leaves — aphids feed inside the curl',
      'Dense colonies of soft-bodied insects on stem tips and undersides of leaves',
      'Sticky honeydew coating on leaf surfaces and surrounding soil',
      'Black sooty mold growing on honeydew deposits',
      'Yellow stippling or mosaic patterns on leaves (virus symptoms)',
      'Presence of ants tending the colony',
      'Stunted, weak new growth'
    ],
    treatment: {
      biological: ['APHIPAR® (Aphidius colemani parasitic wasp) — 250 mummies/100m² — Koppert Kenya', 'APHIPAR®-M (Aphidius matricariae) — for M. persicae', 'Lacewing larvae (Chrysoperla carnea) — generalist predator', 'Insecticidal Soap (fatty acid potassium salts) 1% spray — organic'],
      chemical: ['Aphid Stopper® EC (Imidacloprid) 250ml/ha — PCPB Reg.', 'Karate® 5EC (Lambda-cyhalothrin) 200ml/ha — PCPB Reg.', 'Dimethoate 40EC 500ml/ha — systemic', 'Confidor® 200SL (Imidacloprid) foliar or soil drench'],
      cultural: ['Remove and destroy infested shoot tips', 'Use reflective silver mulches to disorient winged aphids', 'Control ants around crop (ants protect aphids from predators)', 'Plant companion plants: Coriander, Dill, Marigold to attract natural enemies']
    }
  },
  {
    id: 'whitefly',
    name: 'Whitefly (Silverleaf Whitefly)',
    scientific: 'Bemisia tabaci / Trialeurodes vaporariorum',
    category: 'Hemiptera (True Bugs)',
    image: whiteflyImg,
    riskLevel: 'High',
    origin: 'B. tabaci — tropical/subtropical origin, invasive worldwide. T. vaporariorum — greenhouse whitefly.',
    cropsAttacked: ['Tomatoes', 'Beans', 'Cassava', 'Sweet Potato', 'Pepper', 'Aubergine', 'Cotton', 'Cucurbits (Cucumber, Melon)', 'Ornamentals'],
    movementPattern: 'Adults are weak fliers but readily disturbed from plants — they fly up in a cloud when plant is shaken. Females preferentially lay eggs on young leaves at the top of the plant. Crawlers (1st instar) are mobile and move to find feeding sites; subsequent nymphal instars are sessile (fixed) on leaf undersides. Populations build up rapidly in warm, dry conditions.',
    lifecycle: 'Egg (6-10 days) → 4 nymphal instars (15-25 days) → Pupal stage → Adult (30-60 days lifespan). Multiple overlapping generations.',
    signs: [
      'Small white moth-like insects that fly up in a cloud when plant is disturbed',
      'Yellowish, silvery, or bleached patches on leaves (Bemisia causes "silverleaf")',
      'Sticky honeydew on leaf surfaces (lower leaves sticky to touch)',
      'Black sooty mold on honeydew deposits',
      'Tomato Yellow Leaf Curl Virus (TYLCV) — yellow, upward-curling leaves (virus transmitted by B. tabaci)',
      'Cassava Brown Streak Disease — transmitted by whitefly',
      'Stunted growth and reduced fruit quality'
    ],
    treatment: {
      biological: ['LIMONICA® (Amblyseius limonicus predatory mite) — 50/m² — Koppert Kenya, targets eggs & nymphs', 'ENTONEM® (Steinernema feltiae nematodes) — 0.5M/m² — targets pupae in soil', 'Encarsia formosa parasitic wasp — classical biocontrol for greenhouse', 'Yellow sticky traps for adult monitoring and mass trapping'],
      chemical: ['Confidor® 200SL (Imidacloprid) 0.5ml/L — systemic', 'Abamectin 1.8EC 400ml/ha — PCPB Reg.', 'Oberon® 240SC (Spiromesifen) — targets immature stages', 'Actara® 25WG (Thiamethoxam) — PCPB Reg.'],
      cultural: ['Use UV-reflective silver mulches to deter adult landing', 'Rogue out and destroy infected plants immediately', 'Rotate crops — avoid continuous tomato/pepper planting', 'Use certified virus-tested transplants only', 'Insect-proof netting in nurseries and seedbeds']
    }
  },
  {
    id: 'thrips',
    name: 'Thrips (Western Flower Thrips)',
    scientific: 'Frankliniella occidentalis / Thrips tabaci',
    category: 'Thysanoptera',
    image: thripsImg,
    riskLevel: 'Medium',
    origin: 'F. occidentalis — invasive from North America. T. tabaci — cosmopolitan.',
    cropsAttacked: ['Roses & Flowers', 'Pepper', 'Tomatoes', 'Beans', 'Onions', 'Leeks', 'Cucumber', 'Melon', 'Avocado'],
    movementPattern: 'Adults are slender, fast-moving and jump rapidly when disturbed. They fly actively in warm conditions. Thrips move between flowers and leaf axils where they hide. Pupation occurs in soil or plant debris. Populations move from weedy borders into crops. Winged adults can disperse over long distances on wind.',
    lifecycle: 'Egg (2-4 days, inserted into plant tissue) → 2 larval instars (4-7 days) → Pre-pupa + pupa in soil (3-5 days) → Adult (30-45 days). Multiple rapid generations — up to 15/year.',
    signs: [
      'Silver-grey or bronze streaks and patches on leaves and petals',
      'Distorted, deformed young leaves and flower buds',
      'Tiny dark fecal spots (varnish-like) on leaf surfaces',
      'Flowers fail to open properly — petals show brown/black streaking',
      'Fruit with scarring, russeting, or deformity (especially avocado)',
      'Tomato Spotted Wilt Virus (TSWV) — ring spots, necrosis on leaves and fruit',
      'Onion leaves show silver streaks running lengthwise'
    ],
    treatment: {
      biological: ['THRIPEX® (Neoseiulus cucumeris predatory mite) 50-100/m² — Koppert Kenya, targets larvae', 'ENTOMITE® (Hypoaspis miles predatory mite) 100/m² — targets pupae in soil', 'Amblyseius swirskii — broad-spectrum predatory mite for mixed pest pressure', 'Blue sticky traps for adult monitoring'],
      chemical: ['Radiant® SC (Spinetoram) 125ml/ha — PCPB Reg., rotate to avoid resistance', 'Chlorpyrifos 48EC 1.5L/ha — PCPB Reg.', 'Tracer® (Spinosad 480SC) 100ml/ha', 'Dimethoate 40EC 500ml/ha'],
      cultural: ['Remove and destroy infested flowers and plant material', 'Maintain weed-free borders around crop fields', 'Avoid water/nutrient stress (stressed plants more susceptible)', 'Use reflective mulches to disorient adults', 'Fumigate or solarize soil before planting to kill pupae']
    }
  },
  {
    id: 'spider-mite',
    name: 'Spider Mite (Two-Spotted Mite)',
    scientific: 'Tetranychus urticae / Tetranychus evansi',
    category: 'Acari (Mites — not insects but arthropods)',
    image: spiderMiteImg,
    riskLevel: 'High',
    origin: 'T. urticae — cosmopolitan. T. evansi — invasive from South America, now in East Africa.',
    cropsAttacked: ['Tomatoes', 'Beans', 'Pepper', 'Strawberry', 'Cassava', 'Maize', 'Cucumber', 'Roses', 'Avocado', 'Ornamentals'],
    movementPattern: 'Mites are tiny (0.3-0.5mm) and not visible to naked eye individually. They spread by walking between touching leaves/plants, by wind, on tools, clothing, and animals. Populations explode in hot, dry conditions. Mites form protective silk webbing on leaf undersides. In severe infestations, they mass-migrate on silk threads.',
    lifecycle: 'Egg (3-5 days) → Larva (1-2 days) → Protonymph (1-2 days) → Deutonymph (1-2 days) → Adult (30-50 day lifespan). Can complete a generation in 7-10 days at 30°C — very rapid population buildup.',
    signs: [
      'Fine stippling (tiny yellow/white dots) on upper leaf surface — earliest sign',
      'Bronzing, silvering or reddish discolouration of leaves',
      'Fine silk webbing on leaf undersides (visible with good light)',
      'Leaves dry out and drop prematurely',
      'Severe: entire plant bronzed, webbed, and defoliated',
      'Tomato: "russet mite" damage causes stems and leaves to appear dry and brown',
      'Population visible as moving dots on underside of leaf (use hand lens)'
    ],
    treatment: {
      biological: ['SPIDEX® (Phytoseiulus persimilis) 20-50/m² — Koppert Kenya flagship mite biocontrol', 'SPICAL® PLUS (Neoseiulus californicus) 50/m² — tolerates higher temps, more versatile', 'THRIPEX® (N. cucumeris) — for mixed thrips/mite pressure', 'SPIDEX® VITAL — concentrated release sachets for ongoing control'],
      chemical: ['Abamectin 1.8EC 400-500ml/ha — PCPB Reg.', 'Oberon® 240SC (Spiromesifen) 0.75ml/L — targets eggs and nymphs', 'Envidor® 240SC (Spirodiclofen)', 'Kelthane® (Dicofol) — miticide, PCPB Reg.'],
      cultural: ['Avoid over-application of nitrogen (lush growth favours mites)', 'Maintain adequate soil moisture (mites thrive in dry conditions)', 'Remove and destroy heavily infested plant material', 'Spray water forcefully on leaf undersides to dislodge populations', 'Avoid using broad-spectrum insecticides that kill natural mite predators']
    }
  },
  {
    id: 'mealybug',
    name: 'Mealybug',
    scientific: 'Planococcus citri / Pseudococcus longispinus',
    category: 'Hemiptera (Scale Insects)',
    image: mealybugImg,
    riskLevel: 'Medium',
    origin: 'Cosmopolitan — multiple species present in Kenya.',
    cropsAttacked: ['Coffee', 'Citrus', 'Mango', 'Avocado', 'Cassava', 'Pineapple', 'Passion Fruit', 'Grapes', 'Ornamentals', 'Greenhouse vegetables'],
    movementPattern: 'Crawlers (1st instar) are the primary dispersal stage — they walk actively to find feeding sites. Older nymphs and females are largely sedentary. Dispersal occurs via wind, ants (ants carry crawlers to new plants for honeydew), contaminated planting material, tools, and clothing. Ants are key partners — always control ants to control mealybugs.',
    lifecycle: 'Egg mass (100-200 eggs in waxy sac, 10-14 days) → 3 nymphal instars (30-40 days for females) → Adult female (30-60 days). Males are winged and short-lived. Multiple overlapping generations.',
    signs: [
      'White cottony, waxy clusters on stems, leaf axils, and fruit',
      'White powdery wax covering individual insects',
      'Sticky honeydew deposits on plant surfaces and soil',
      'Black sooty mold growing on honeydew',
      'Stunted growth and distorted new shoots',
      'Presence of ants climbing stems and tending colonies',
      'Yellowing and premature drop of leaves and fruit',
      'In citrus: fruit deformation and postharvest quality loss'
    ],
    treatment: {
      biological: ['Cryptolaemus montrouzieri (Mealybug destroyer ladybug) — classical biocontrol', 'Anagyrus pseudococci parasitic wasp — KALRO programme', 'ENTOMITE® (Hypoaspis miles) for soil-dwelling species', 'Insecticidal soap or neem oil spray — physical and chemical action'],
      chemical: ['Movento® 100SC (Spirotetramat) — systemic, travels to roots where mealybugs hide', 'Chlorpyrifos 48EC 1.5L/ha — PCPB Reg., contact kill', 'Confidor® 200SL (Imidacloprid) 0.5ml/L soil drench — systemic', 'Karate® 5EC (Lambda-cyhalothrin) 200ml/ha'],
      cultural: ['Control ant populations using sticky bands on tree trunks (Tanglefoot®)', 'Use clean planting material — inspect all nursery stock', 'Remove and destroy heavily infested plant parts', 'Avoid excessive nitrogen fertilization (promotes lush growth)', 'Quarantine new plants for 2-3 weeks before introducing to farm']
    }
  },
  {
    id: 'cutworm',
    name: 'Cutworm (Black Cutworm)',
    scientific: 'Agrotis ipsilon / Agrotis segetum',
    category: 'Lepidoptera (Moths & Caterpillars)',
    image: cutwormImg,
    riskLevel: 'High',
    origin: 'Cosmopolitan. Multiple Agrotis species in Kenya.',
    cropsAttacked: ['Maize', 'Beans', 'Cabbage', 'Tomatoes', 'Onions', 'Potatoes', 'Carrots', 'Wheat', 'Sunflower', 'Most seedlings & transplants'],
    movementPattern: 'Adults are nocturnal moths that fly at night to mate and lay eggs. Larvae are nocturnal — they hide in soil during the day and emerge at night to feed. They move through the soil surface layer, crawling from plant to plant at night. Older larvae can crawl several meters per night. They curl up tightly when disturbed.',
    lifecycle: 'Egg (5-10 days on soil surface or plant tissue) → Larva (30-40 days, 6-7 instars) → Pupa in soil (14-21 days) → Adult moth (7-14 days). 2-3 generations per year.',
    signs: [
      'Young plants cut off at soil level — "clean cut" at the base of stem (key identifier)',
      'Wilted or collapsed seedlings with severed stems',
      'Larvae found curled up in C-shape in soil near damaged plants (dig 5-10cm deep)',
      'Irregular gaps in crop rows where plants have been cut',
      'Climbing cutworms: ragged holes chewed in leaves higher on plant at night',
      'Damage most severe in first 3-4 weeks after crop emergence',
      'Heavy damage after ploughing grassland or planting in previously weedy land'
    ],
    treatment: {
      biological: ['ENTOMITE® or Steinernema carpocapsae nematodes drenched into soil — PCPB compatible', 'Bacillus thuringiensis (Bt var. kurstaki) bait or spray on soil surface', 'Naturally occurring ground beetles (Carabidae) — preserve by avoiding soil tillage'],
      chemical: ['Dursban® 10G (Chlorpyrifos granules) into soil at planting — PCPB Reg.', 'Lambda-cyhalothrin 5EC drench at base of plants', 'Poison bran bait: mix bran + Chlorpyrifos + molasses — spread at base of plants at dusk', 'Carbofuran 3G granules into soil at planting'],
      cultural: ['Deep plough before planting to expose and kill pupae and larvae to birds', 'Destroy crop residues and weed cover before planting', 'Irrigate before planting to bring larvae to surface (birds will feed)', 'Plant earlier in season to avoid peak egg-laying period', 'Use physical collars (cut plastic bottles) around transplant stems']
    }
  },
  {
    id: 'bollworm',
    name: 'African Bollworm / Tomato Fruit Worm',
    scientific: 'Helicoverpa armigera',
    category: 'Lepidoptera (Moths & Caterpillars)',
    image: fallArmywormImg, // reuse similar caterpillar image
    riskLevel: 'High',
    origin: 'Native to Old World — Africa, Europe, Asia. Highly polyphagous and resistance-prone.',
    cropsAttacked: ['Tomatoes', 'Cotton', 'Chickpea', 'Maize (earworm)', 'Sorghum', 'Beans', 'Pepper', 'Sunflower', 'Tobacco'],
    movementPattern: 'Moths are strong fliers, highly migratory — can fly 50-100km per night on wind. Females lay single eggs on flowers, buds, and young fruits. Larvae initially feed on foliage then bore into fruits/bolls. Only ONE larva per fruit (cannibalistic). Larvae drop to soil to pupate when mature.',
    lifecycle: 'Egg (2-5 days, laid singly) → Larva (14-21 days, 6 instars) → Pupa in soil (12-21 days) → Adult moth (7-14 days). 3-4 generations per year in Kenya.',
    signs: [
      'Entry holes on tomato fruit, usually at shoulder near calyx',
      'Frass at entry hole, fruit surface stained brown',
      'Internal rot and mold inside fruits due to entry wound',
      'One larva per fruit (rarely two — cannibalistic)',
      'Young larvae feed on flowers and small fruits first',
      'Cotton: damaged bolls with entry holes and stained lint',
      'Maize: larvae in ear eating grain, frass on silks',
      'Polyphagous — if one crop is exhausted, moves to adjacent crops'
    ],
    treatment: {
      biological: ['Bacillus thuringiensis (Bt) 500g/ha — apply at first egg hatch', 'HELICOVEX® (H. armigera NPV baculovirus) — species-specific virus', 'Chrysoperla carnea lacewing larvae — egg and young larva predator', 'Trichogramma spp. egg parasitoids — released at adult emergence peak'],
      chemical: ['Coragen® 20SC (Chlorantraniliprole) 150ml/ha — PCPB Reg.', 'Radiant® SC (Spinetoram) 125ml/ha', 'Tracer® (Spinosad) 100ml/ha', 'Karate® 5EC (Lambda-cyhalothrin) 200ml/ha — preventive cover sprays'],
      cultural: ['Use pheromone traps (Helilure) to monitor adult flights', 'Hand-pick larvae from small-scale tomato plots', 'Encourage natural enemies: avoid broad-spectrum insecticide overuse', 'Remove and destroy infested fruits immediately — do not leave on ground', 'Rotate crops annually']
    }
  },
  {
    id: 'fruit-fly',
    name: 'African Fruit Fly / Oriental Fruit Fly',
    scientific: 'Bactrocera dorsalis / Ceratitis capitata',
    category: 'Diptera (True Flies)',
    image: whiteflyImg, // reuse — visual representation
    riskLevel: 'High',
    origin: 'B. dorsalis — invasive from Asia, now dominant in East Africa. C. capitata — Mediterranean species.',
    cropsAttacked: ['Mango', 'Avocado', 'Passion Fruit', 'Guava', 'Citrus', 'Papaya', 'Tomatoes', 'Pepper', 'Peach', 'Apricot'],
    movementPattern: 'Adults fly actively during warm daylight hours. Females use a sharp ovipositor to puncture fruit skin and lay eggs inside. Maggots develop inside fruit causing internal rot. Mature maggots drop to soil to pupate. Adults aggregate in cool shaded areas (trees) during midday heat. Males are attracted to methyl eugenol pheromone lures — used in traps.',
    lifecycle: 'Egg (1-2 days inside fruit) → Larva/maggot (7-12 days) → Pupa in soil (7-14 days) → Adult (30-90 days lifespan). Multiple generations — 10-12/year in tropical Kenya.',
    signs: [
      'Small puncture mark on fruit surface (oviposition sting)',
      'Yellow halo or dimple around the sting mark',
      'Premature fruit drop (infested fruit falls early)',
      'Internal brown rot and tunnelling by white maggots',
      'Multiple maggots found inside rotten fruit',
      'Fruit surface remains intact but interior is rotten',
      'Sweet fermentation odour from infested fruit',
      'High adult populations visible around ripe fruit'
    ],
    treatment: {
      biological: ['Protein bait + Spinosad (GF-120® or equivalent) — spot sprayed on foliage, not fruit', 'Male annihilation technique: Methyl eugenol + insecticide in traps', 'Natural parasitoids: Fopius arisanus (egg-larval parasitoid) — KEPHIS/CABI programme'],
      chemical: ['Dimethoate 40EC 1L/ha + protein bait (attract-and-kill)', 'Malathion 50EC + protein attractant bait spray', 'Spinosad bait stations (GF-120) — targeted, low environmental impact', 'Karate® 5EC as cover spray during fruit set'],
      cultural: ['Harvest fruit promptly when ripe — do not leave on tree or ground', 'Collect and destroy all fallen fruit (bury 50cm or in covered pit)', 'Male annihilation: Methyl eugenol + malathion pads in trees', 'Wrap individual fruits in paper bags at fruit set (table-scale)', 'Remove host weeds near orchards', 'Plastic-covered protein bait traps — at least 4 per hectare']
    }
  },
  {
    id: 'diamondback',
    name: 'Diamondback Moth',
    scientific: 'Plutella xylostella',
    category: 'Lepidoptera (Moths & Caterpillars)',
    image: stemBorerImg, // reuse
    riskLevel: 'High',
    origin: 'Cosmopolitan. Probably originated in Mediterranean. Now highly resistant to many insecticides globally.',
    cropsAttacked: ['Cabbage', 'Kale (Sukuma Wiki)', 'Broccoli', 'Cauliflower', 'Collards', 'Brussels Sprouts', 'Watercress', 'Canola/Rapeseed'],
    movementPattern: 'Small, slender moths fly erratically in a zigzag pattern, low over crops — distinctive flight behavior. Moths are nocturnal but can be disturbed during day. Females lay tiny eggs (1-5) on leaf surfaces, preferring upper surfaces of younger leaves. Larvae are very active — they wriggle violently and drop on silk threads when disturbed. Pupae in loose silk cocoons attached to leaves.',
    lifecycle: 'Egg (4-8 days) → Larva (9-14 days, 4 instars) → Pupa (5-10 days in leaf cocoon) → Adult (10-21 days). Many overlapping generations — 12-15/year. Resistance develops very quickly to insecticides.',
    signs: [
      '"Window paning" — larvae scrape away leaf surface leaving transparent patches (1st-2nd instar)',
      'Holes through leaves — young larvae feed from underside, older from above',
      'Characteristic "shot-hole" appearance on older kale leaves',
      'Tiny pale green caterpillars that wriggle and drop off when plant disturbed',
      'Small silken pupal cases attached to leaf surfaces or undersides',
      'Severe: leaves reduced to skeleton framework — economic damage in 2-3 weeks',
      'Head of cabbage riddled with entry holes and contaminated with frass'
    ],
    treatment: {
      biological: ['Bacillus thuringiensis (Bt) 500-750g/ha — HIGHLY EFFECTIVE, apply every 7 days', 'Cotesia plutellae parasitic wasp — naturally occurring, support by avoiding insecticides', 'Spinosad-based products — rotate with Bt to manage resistance', 'THRIPEX® (Neoseiulus cucumeris) in trials for egg predation'],
      chemical: ['Radiant® SC (Spinetoram) 125ml/ha — effective, rotate regularly', 'Proclaim® (Emamectin benzoate) 150ml/ha — PCPB Reg.', 'Indoxacarb 150EC 200ml/ha — PCPB Reg.', '⚠️ Rotate ALL chemicals — DBM develops resistance in 3-4 generations'],
      cultural: ['Intercrop with tomatoes or non-brassica crops (disrupts host-finding)', 'Remove crop debris immediately after harvest — pupae in debris', 'Avoid planting brassicas year-round in same field (breaks life cycle)', 'Net nurseries and seedbeds to exclude egg-laying adults', 'Plant resistant varieties when available (KALRO selections)']
    }
  },
  {
    id: 'locust',
    name: 'Desert Locust',
    scientific: 'Schistocerca gregaria',
    category: 'Orthoptera (Grasshoppers & Locusts)',
    image: aphidsImg, // reuse — placeholder
    riskLevel: 'High',
    origin: 'Native to Africa/Middle East. Upsurge years: 2019-2021 devastated East Africa.',
    cropsAttacked: ['ALL CROPS', 'Maize', 'Wheat', 'Sorghum', 'Beans', 'Vegetables', 'Pastures', 'Fruit trees', 'Any green vegetation'],
    movementPattern: 'Solitary phase: individual grasshoppers, low population density, sedentary. Gregarious phase (SWARM): triggered by high population density — insects synchronize behavior, forming bands (hoppers) and swarms (adults). Swarms can cover 1-3 km² and contain 40-80 million locusts per km². Swarms travel with wind — up to 150km/day. A single swarm of 1 km² eats same as 35,000 people daily.',
    lifecycle: 'Egg pod in soil (10-65 days depending on temperature) → Hopper (nymph, 5 instars, 25-30 days) → Adult (can live 3-5 months). Swarm formation: 3-4 weeks from start of hopper stage.',
    signs: [
      'EMERGENCY: Report any unusual grasshopper/locust sightings to KALRO/County agriculture office immediately',
      'Large bands of hopping nymphs (wingless juveniles) moving in same direction across fields',
      'Adult swarms appear as large brown/yellow "cloud" visible from distance',
      'Complete defoliation of plants — only bare stems remaining',
      'Rapid, total crop loss in hours to days — no crop escapes in swarm path',
      'Unusual numbers of large grasshoppers with colorful wings (yellow-green-red)',
      'Egg pods in soil — pale yellow foam tubes 7-10cm deep in sandy soil'
    ],
    treatment: {
      biological: ['Green Muscle® (Metarhizium acridum) biopesticide — ultra-low volume spray from aircraft or vehicle', 'KALRO/FAO coordinated biological control programmes'],
      chemical: ['EMERGENCY GROUND OPERATIONS: Malathion ULV spray from vehicle-mounted sprayers', 'Chlorpyrifos ULV (Dursban®) air application — FAO/government coordinated', 'Fenitrothion ULV — for locust band control at hopper stage (most cost-effective)', '⚠️ Individual farmer control is INEFFECTIVE against swarms — coordinate with authorities'],
      cultural: ['REGISTER with county agriculture office — Kenya Locust Control Unit (DLCO-EA)', 'Monitor FAO Desert Locust watch (www.fao.org/locusts)', 'Early warning: Scout borders, clear swarm landing zones, alert neighbors', 'Hopper bands (nymphs): can be physically driven into trenches and buried']
    }
  },
  {
    id: 'scale-insects',
    name: 'Scale Insects (Soft & Armoured Scale)',
    scientific: 'Coccus viridis / Saissetia coffeae / Aspidiotus destructor',
    category: 'Hemiptera (Scale Insects)',
    image: mealybugImg,
    riskLevel: 'Medium',
    origin: 'Multiple species — cosmopolitan.',
    cropsAttacked: ['Coffee', 'Tea', 'Citrus', 'Mango', 'Avocado', 'Guava', 'Ornamental trees', 'Passion Fruit'],
    movementPattern: 'Crawlers (1st instar) are the only mobile stage — tiny yellow specks that walk actively on plant surfaces and are dispersed by wind, birds, insects, and tools. Settled scales are immobile and die if dislodged. Ants transport crawlers to new hosts in exchange for honeydew. Armoured scales have a protective waxy cover; soft scales produce honeydew.',
    lifecycle: 'Soft scale: Egg (under female body, 200-500 eggs) → 2-3 nymphal instars → Adult (60-90 days). Armoured scale: 3 nymphal instars under developing scale cover. 2-4 generations per year.',
    signs: [
      'Circular brown or grey bumps (armoured scale) or brown/green blobs (soft scale) on stems and branches',
      'White waxy cottony material similar to mealybugs (some species)',
      'Sooty mold covering branches and leaves below infestation',
      'Yellowing and dieback of branches and twigs',
      'Ants trailing up and down trunks and branches',
      'Sticky honeydew on leaves below (soft scales only)',
      'Coffee: green scale on stems = C. viridis',
      'Coconut: Aspidiotus destructor causes "coconut scale" — yellowing fronds'
    ],
    treatment: {
      biological: ['Chilocorus species (scale-eating ladybird beetles) — naturally occurring', 'Metaphycus helvolus parasitic wasp — for Saissetia scale on citrus', 'Coccophagus lounsburyi parasitoid — coffee green scale', 'White oil (petroleum oil emulsion) 2% spray — physical smothering'],
      chemical: ['Movento® 100SC (Spirotetramat) — systemic, disrupts reproduction', 'Chlorpyrifos 48EC 1.5L/ha — contact kill of crawlers', 'White oil emulsion 2% — spray at crawler emergence', 'Abamectin 1.8EC 400ml/ha — for mixed infestations'],
      cultural: ['Control ants rigorously (banding trunks with Tanglefoot®)', 'Prune heavily infested branches and destroy', 'Improve air circulation through canopy management', 'Inspect all planting material from nurseries before introduction', 'Avoid overuse of nitrogen fertilizers (promotes scale buildup)']
    }
  }
];

/* ================================================================
   KALRO/PCPB PRODUCTS (For Active Alerts)
   ================================================================ */
const KALRO_PEST_PRODUCTS = {
  'Fall Armyworm': [
    { name: 'Coragen® 20SC', ai: 'Chlorantraniliprole', rate: '150–200 ml/ha', note: 'PCPB Reg. No. CR/P/2018/001' },
    { name: 'Belt® 480SC', ai: 'Flubendiamide', rate: '125 ml/ha', note: 'PCPB Reg. No. CR/P/2018/002' },
    { name: 'Emmaban® EC', ai: 'Emamectin Benzoate', rate: '300 ml/ha', note: 'Certified biological substitute' },
    { name: 'Neem Oil Extract (Bio)', ai: 'Azadirachtin', rate: '5 L/ha', note: 'KALRO approved bio-pesticide' }
  ],
  'Stem Borer': [
    { name: 'Furadan 3G®', ai: 'Carbofuran (granules)', rate: '10 kg/ha whorls', note: 'PCPB Reg. No. CR/G/2012/014' },
    { name: 'Fastac® 10EC', ai: 'Alpha-cypermethrin', rate: '200 ml/ha', note: 'PCPB Reg. No. CR/P/2007/005' },
    { name: 'Trichogramma spp. (Bio)', ai: 'Parasitic wasp', rate: '200,000/ha', note: 'KALRO bio-control programme' }
  ],
  'Aphids': [
    { name: 'APHIPAR® (Bio)', ai: 'Aphidius colemani', rate: '250 mummies/100m²', note: 'Koppert Kenya biocontrol' },
    { name: 'Karate® 5EC', ai: 'Lambda-cyhalothrin', rate: '200 ml/ha', note: 'PCPB Reg. No. CR/P/2000/003' },
    { name: 'Confidor® 200SL', ai: 'Imidacloprid', rate: '0.5 ml/L', note: 'PCPB registered systemic' }
  ],
  'Whitefly': [
    { name: 'LIMONICA® (Bio)', ai: 'Amblyseius limonicus', rate: '50/m²', note: 'Koppert Kenya — greenhouse whitefly' },
    { name: 'Confidor® 200SL', ai: 'Imidacloprid', rate: '0.5 ml/L', note: 'PCPB Reg. | systemic' },
    { name: 'Abamectin 1.8EC', ai: 'Abamectin', rate: '400 ml/ha', note: 'PCPB Reg. No. CR/P/2012/009' }
  ],
  'Thrips': [
    { name: 'THRIPEX® (Bio)', ai: 'Neoseiulus cucumeris', rate: '50–100/m²', note: 'Koppert Kenya biocontrol' },
    { name: 'Radiant® SC', ai: 'Spinetoram', rate: '125 ml/ha', note: 'PCPB Reg. | rotate to avoid resistance' },
    { name: 'ENTOMITE® (Bio)', ai: 'Hypoaspis miles', rate: '100/m²', note: 'Koppert Kenya | Controls pupae in soil' }
  ],
  'Spider Mite': [
    { name: 'SPIDEX® (Bio)', ai: 'Phytoseiulus persimilis', rate: '20–50/m²', note: 'Koppert Kenya flagship mite biocontrol' },
    { name: 'SPICAL® PLUS (Bio)', ai: 'Neoseiulus californicus', rate: '50/m²', note: 'Koppert Kenya | tolerates higher temps' },
    { name: 'Abamectin 1.8EC', ai: 'Abamectin', rate: '400 ml/ha', note: 'PCPB Reg. No. CR/P/2012/009' }
  ]
};

const WEED_DATA = [
  {
    id: 1,
    name: 'Striga (Witchweed)',
    scientific: 'Striga hermonthica',
    riskLevel: 'High',
    affectedCrops: 'Maize, Sorghum, Millet',
    description: 'A parasitic weed attaching to cereal roots. Causes 20-80% yield loss. Prevalent in Western & Nyanza regions.',
    illustration: strigaImg,
    cultural: ['Use certified Striga-free seed', 'Deep tillage before planting', 'Inter-crop with Desmodium (Push-Pull)', 'IR Maize varieties (WEMA project)', 'Hand-pull before flowering'],
    herbicides: [
      { name: 'Imazapyr (IR-Maize only)', rate: '2–3 L/ha', note: 'PCPB Reg. — for IR-maize ONLY' },
      { name: 'Herbicide-coated sorghum seeds', rate: 'Per label', note: 'KALRO Striga control programme' }
    ]
  },
  {
    id: 2,
    name: 'Blackjack',
    scientific: 'Bidens pilosa',
    riskLevel: 'Medium',
    affectedCrops: 'Maize, Vegetables, Horticultural',
    description: 'Fast-spreading annual weed with sticky seeds. Common in disturbed soils across all Kenyan regions.',
    illustration: blackjackImg,
    cultural: ['Early weeding within 3 weeks of planting', 'Mulching around crop rows', 'Avoid carrying seeds on clothing/tools'],
    herbicides: [
      { name: 'Roundup® (Glyphosate 480g/L)', rate: '3–5 L/ha (pre-plant)', note: 'PCPB Reg. No. CR/H/2001/001' },
      { name: 'Acetochlor 900EC', rate: '1.5 L/ha (pre-emergent)', note: 'PCPB Reg. No. CR/H/2010/003' }
    ]
  },
  {
    id: 3,
    name: 'Couchgrass',
    scientific: 'Cynodon dactylon',
    riskLevel: 'Medium',
    affectedCrops: 'Wheat, Maize, Sugarcane',
    description: 'Persistent grass weed with deep rhizomes. Very hard to eradicate. Thrives in irrigated conditions.',
    illustration: couchgrassImg,
    cultural: ['Repeated cultivation to expose rhizomes', 'Avoid spreading clippings', 'Solarization for severe infestations'],
    herbicides: [
      { name: 'Fusilade® Forte (Fluazifop-P)', rate: '1.5 L/ha', note: 'PCPB Reg. — selective grass killer' },
      { name: 'Glyphosate 480g/L', rate: '4–6 L/ha (non-selective)', note: 'PCPB Reg. No. CR/H/2001/001' }
    ]
  }
];

const PEST_DATA_DEFAULT = [
  {
    id: 1, title: 'Fall Armyworm Alert', risk_level: 'High',
    sector: 'Nakuru County - Njoro (Maize & Wheat)',
    description: 'Initial sightings of Fall Armyworm egg masses in neighboring maize fields. Warm temperatures accelerating hatching cycles.',
    mitigation: 'Examine maize leaf whorls for pinholes and wet frass. Apply Neem Oil for early-stage larvae. Use Coragen® 20SC for moderate-high infestations.',
    pestKey: 'Fall Armyworm',
    symptoms: ['Pinholes on young leaves', 'Wet frass in leaf whorls', 'Ragged leaf edges', 'Inverted Y mark on larva head']
  },
  {
    id: 2, title: 'Stem Borer Risk Warning', risk_level: 'Medium',
    sector: 'Trans Nzoia County - Kwanza (Maize)',
    description: 'Late-planted maize susceptible to stem borer attacks in damp field depressions.',
    mitigation: 'Apply Push-Pull intercropping or METARHIZA® WP biopesticide. Fastac® 10EC if threshold >30% infestation.',
    pestKey: 'Stem Borer',
    symptoms: ['Dead heart (wilting central shoot)', 'Window pane feeding marks', 'Entry holes on stems']
  },
  {
    id: 3, title: 'Aphid Colony Outbreak', risk_level: 'Medium',
    sector: 'Kiambu County - Limuru (Vegetables)',
    description: 'Aphid colonies on undersides of kale and spinach. Risk of sooty mold and virus transmission.',
    mitigation: 'Introduce APHIPAR® parasitic wasps in greenhouses. Field crops: Karate® 5EC early morning.',
    pestKey: 'Aphids',
    symptoms: ['Curling distorted leaves', 'Sticky honeydew on surfaces', 'Sooty mold', 'Ants tending colony']
  },
  {
    id: 4, title: 'Whitefly Infestation', risk_level: 'High',
    sector: 'Meru County - Tigania (Tomatoes)',
    description: 'Heavy Bemisia tabaci infestations in tomato areas. Key vector of Tomato Yellow Leaf Curl Virus.',
    mitigation: 'Deploy yellow sticky traps. LIMONICA® predatory mites in greenhouses. Confidor® 200SL in open field.',
    pestKey: 'Whitefly',
    symptoms: ['White insects fly up when plant disturbed', 'Yellowing wilting leaves', 'Honeydew deposits', 'TYLCV virus symptoms']
  },
  {
    id: 5, title: 'Thrips Damage Alert', risk_level: 'Medium',
    sector: 'Naivasha, Rift Valley (Roses & Horticulture)',
    description: 'Western Flower Thrips populations rising in floriculture. Damages flower quality and vectors TSWV.',
    mitigation: 'Deploy THRIPEX® predatory mites. Chemical: Radiant® SC — rotate with Chlorpyrifos to manage resistance.',
    pestKey: 'Thrips',
    symptoms: ['Silver-grey streaks on leaves/petals', 'Distorted flowers', 'Dark fecal spots', 'Flowers fail to open']
  }
];

/* ================================================================
   COMPONENT
   ================================================================ */
const PestAlertsTab = () => {
  const [activeSection, setActiveSection] = useState('pests');
  const [alerts, setAlerts] = useState(PEST_DATA_DEFAULT);
  const [expandedAlert, setExpandedAlert] = useState(null);
  const [expandedWeed, setExpandedWeed] = useState(null);
  const [selectedPest, setSelectedPest] = useState(null);
  const [encyclopediaSearch, setEncyclopediaSearch] = useState('');
  const [encyclopediaFilter, setEncyclopediaFilter] = useState('All');

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/api/pest-alerts/');
      if (response.data && response.data.length > 0) setAlerts(response.data);
    } catch { }
  };

  const getRiskColor = (level) => {
    if (level === 'High') return 'var(--status-high)';
    if (level === 'Medium') return 'var(--status-med)';
    return 'var(--status-low)';
  };

  const getRiskIcon = (level) => {
    if (level === 'High') return '🔴';
    if (level === 'Medium') return '🟡';
    return '🟢';
  };

  const categories = ['All', ...new Set(PEST_ENCYCLOPEDIA.map(p => p.category.split(' ')[0]))];

  const filteredPests = PEST_ENCYCLOPEDIA.filter(pest => {
    const matchesSearch = encyclopediaSearch === '' ||
      pest.name.toLowerCase().includes(encyclopediaSearch.toLowerCase()) ||
      pest.scientific.toLowerCase().includes(encyclopediaSearch.toLowerCase()) ||
      pest.cropsAttacked.some(c => c.toLowerCase().includes(encyclopediaSearch.toLowerCase()));
    const matchesFilter = encyclopediaFilter === 'All' || pest.category.startsWith(encyclopediaFilter);
    return matchesSearch && matchesFilter;
  });

  const tabs = [
    { id: 'pests', label: '🚨 Active Alerts' },
    { id: 'encyclopedia', label: '📖 Pest Library' },
    { id: 'weeds', label: '🌿 Weed Control' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="card">
        <div className="card-subtitle">Crop Protection Advisory</div>
        <h3 style={{ color: 'var(--primary-color)', fontFamily: 'var(--font-header)', margin: 0 }}>
          Pest & Weed Management Centre
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginTop: '-8px' }}>
          Comprehensive pest encyclopedia with KALRO/PCPB treatments and Koppert Kenya biocontrol solutions.
        </p>

        <div style={{
          background: 'linear-gradient(135deg, #004832 0%, #1B5E20 100%)',
          borderRadius: '10px', padding: '12px 18px',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <span style={{ fontSize: '1.5rem' }}>🌿</span>
          <div>
            <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.88rem' }}>Koppert Kenya Biocontrol Intelligence</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.78rem' }}>
              13 pest species covered · KALRO/PCPB approved treatments · Biological & chemical controls
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { setActiveSection(tab.id); setSelectedPest(null); }}
              style={{
                padding: '10px 20px', borderRadius: '25px', border: 'none',
                fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer',
                background: activeSection === tab.id ? 'var(--primary-color)' : 'var(--bg-input)',
                color: activeSection === tab.id ? '#fff' : 'var(--text-dark)',
                transition: 'var(--transition-smooth)',
                boxShadow: activeSection === tab.id ? '0 4px 12px rgba(27,94,32,0.3)' : 'none'
              }}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── ACTIVE PEST ALERTS ── */}
      {activeSection === 'pests' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {alerts.map((alert) => {
            const isExpanded = expandedAlert === alert.id;
            const pestKey = alert.pestKey || 'Fall Armyworm';
            const products = KALRO_PEST_PRODUCTS[pestKey] || KALRO_PEST_PRODUCTS['Fall Armyworm'];
            const pestData = PEST_ENCYCLOPEDIA.find(p => p.name === pestKey);
            const illustration = pestData?.image || aphidsImg;
            return (
              <div key={alert.id} className="card" style={{ gap: '14px', borderLeft: `4px solid ${getRiskColor(alert.risk_level)}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, width: '95px', height: '70px', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${getRiskColor(alert.risk_level)}40` }}>
                      <img src={illustration} alt={pestKey} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', color: 'var(--text-dark)', fontFamily: 'var(--font-header)', margin: '0 0 4px 0' }}>
                        {getRiskIcon(alert.risk_level)} {alert.title}
                      </h4>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 <strong>{alert.sector}</strong></div>
                    </div>
                  </div>
                  <span style={{ backgroundColor: `${getRiskColor(alert.risk_level)}15`, color: getRiskColor(alert.risk_level), padding: '5px 14px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${getRiskColor(alert.risk_level)}30`, whiteSpace: 'nowrap' }}>
                    {alert.risk_level} Risk
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', lineHeight: '1.6', margin: 0 }}>{alert.description}</p>
                </div>

                {alert.symptoms && (
                  <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--accent-gold)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔍 Watch for:</div>
                    <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      {alert.symptoms.map((s, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-dark)' }}>{s}</li>)}
                    </ul>
                  </div>
                )}

                <div style={{ backgroundColor: `${getRiskColor(alert.risk_level)}08`, padding: '12px', borderRadius: '8px', borderLeft: `3px solid ${getRiskColor(alert.risk_level)}` }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--primary-color)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>✅ Treatment</div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: '1.5', margin: 0 }}>{alert.mitigation}</p>
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                    style={{ background: isExpanded ? 'var(--primary-color)' : 'none', border: '2px solid var(--primary-color)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', color: isExpanded ? '#fff' : 'var(--primary-color)', fontWeight: 700, fontSize: '0.82rem', transition: 'var(--transition-smooth)' }}>
                    {isExpanded ? '▲ Hide Products' : '▼ KALRO Approved Products'}
                  </button>
                  <button onClick={() => { setActiveSection('encyclopedia'); setSelectedPest(PEST_ENCYCLOPEDIA.find(p => p.name === pestKey)); }}
                    style={{ background: 'none', border: '2px solid var(--accent-gold)', borderRadius: '8px', padding: '7px 14px', cursor: 'pointer', color: 'var(--accent-gold)', fontWeight: 700, fontSize: '0.82rem' }}>
                    📖 Full Pest Guide
                  </button>
                </div>

                {isExpanded && (
                  <div style={{ background: 'var(--bg-input)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '12px', fontSize: '0.88rem' }}>🏛️ KALRO/PCPB Approved Products:</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: '10px' }}>
                      {products.map((p, i) => (
                        <div key={i} style={{ padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: p.ai.includes('Bio') || p.ai.includes('parasit') || p.ai.includes('mite') ? '3px solid var(--status-low)' : '3px solid var(--accent-gold)' }}>
                          <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.85rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>A.I.: <strong>{p.ai}</strong> | Rate: <strong>{p.rate}</strong></div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--status-low)', marginTop: '4px', fontWeight: 600 }}>✓ {p.note}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── PEST ENCYCLOPEDIA ── */}
      {activeSection === 'encyclopedia' && !selectedPest && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search & Filter */}
          <div className="card" style={{ gap: '12px' }}>
            <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-dark)' }}>📖 Complete Pest Library — {PEST_ENCYCLOPEDIA.length} Pests</div>
            <input
              type="text"
              className="form-input"
              placeholder="Search by pest name, crop affected (e.g. tomato, maize)..."
              value={encyclopediaSearch}
              onChange={(e) => setEncyclopediaSearch(e.target.value)}
              style={{ fontSize: '0.9rem' }}
            />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map(cat => (
                <button key={cat} onClick={() => setEncyclopediaFilter(cat)}
                  style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', background: encyclopediaFilter === cat ? 'var(--primary-color)' : 'var(--bg-input)', color: encyclopediaFilter === cat ? '#fff' : 'var(--text-dark)', transition: 'var(--transition-smooth)' }}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Pest Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '16px' }}>
            {filteredPests.map(pest => (
              <div key={pest.id} className="card" style={{ gap: '12px', cursor: 'pointer', borderLeft: `4px solid ${getRiskColor(pest.riskLevel)}`, transition: 'var(--transition-smooth)' }}
                onClick={() => setSelectedPest(pest)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}>
                {/* Card Image */}
                <div style={{ width: '100%', height: '130px', borderRadius: '8px', overflow: 'hidden' }}>
                  <img src={pest.image} alt={pest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.parentElement.style.background = 'var(--bg-input)'; e.target.style.display = 'none'; }} />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ margin: '0 0 2px', fontSize: '0.95rem', fontFamily: 'var(--font-header)', color: 'var(--text-dark)' }}>{pest.name}</h4>
                    <span style={{ color: getRiskColor(pest.riskLevel), fontSize: '0.72rem', fontWeight: 700, background: `${getRiskColor(pest.riskLevel)}15`, padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap', marginLeft: '6px' }}>{pest.riskLevel}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '6px' }}>{pest.scientific}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '4px 8px', borderRadius: '6px' }}>
                    <span style={{ fontWeight: 600 }}>Attacks: </span>{pest.cropsAttacked.slice(0, 4).join(', ')}{pest.cropsAttacked.length > 4 ? '...' : ''}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>{pest.category}</div>
                </div>
                <div style={{ color: 'var(--primary-color)', fontSize: '0.82rem', fontWeight: 700, textAlign: 'right' }}>View Full Guide →</div>
              </div>
            ))}
          </div>
          {filteredPests.length === 0 && (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px' }}>
              No pests found for "{encyclopediaSearch}"
            </div>
          )}
        </div>
      )}

      {/* ── SELECTED PEST DETAIL VIEW ── */}
      {activeSection === 'encyclopedia' && selectedPest && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button onClick={() => setSelectedPest(null)}
            style={{ alignSelf: 'flex-start', background: 'none', border: '2px solid var(--primary-color)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: 'var(--primary-color)', fontWeight: 700, fontSize: '0.85rem' }}>
            ← Back to Pest Library
          </button>

          {/* Hero Image + Title */}
          <div className="card" style={{ gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'start' }}>
              <div style={{ borderRadius: '12px', overflow: 'hidden', height: '200px' }}>
                <img src={selectedPest.image} alt={selectedPest.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.parentElement.style.background = 'var(--bg-input)'; e.target.style.display = 'none'; }} />
              </div>
              <div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{ color: getRiskColor(selectedPest.riskLevel), fontWeight: 700, background: `${getRiskColor(selectedPest.riskLevel)}15`, padding: '4px 12px', borderRadius: '15px', fontSize: '0.82rem', border: `1px solid ${getRiskColor(selectedPest.riskLevel)}40` }}>
                    {selectedPest.riskLevel} Risk
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem', background: 'var(--bg-input)', padding: '4px 10px', borderRadius: '10px' }}>{selectedPest.category}</span>
                </div>
                <h2 style={{ margin: '0 0 4px', color: 'var(--primary-color)', fontFamily: 'var(--font-header)' }}>{selectedPest.name}</h2>
                <div style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>{selectedPest.scientific}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '8px 12px', borderRadius: '8px', lineHeight: '1.5' }}>
                  <strong>Origin:</strong> {selectedPest.origin}
                </div>
              </div>
            </div>

            {/* Crops Attacked */}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>🌾 Crops Attacked</div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {selectedPest.cropsAttacked.map((crop, i) => (
                  <span key={i} style={{ background: 'var(--primary-light)', color: 'var(--primary-color)', padding: '4px 12px', borderRadius: '15px', fontSize: '0.8rem', fontWeight: 600, border: '1px solid rgba(27,94,32,0.2)' }}>{crop}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Movement Pattern */}
          <div className="card" style={{ gap: '10px' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔄 Movement & Behaviour Pattern</div>
            <p style={{ margin: 0, color: 'var(--text-dark)', fontSize: '0.9rem', lineHeight: '1.7' }}>{selectedPest.movementPattern}</p>
          </div>

          {/* Lifecycle */}
          <div className="card" style={{ gap: '10px', background: 'var(--bg-message-unread)' }}>
            <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔬 Life Cycle</div>
            <p style={{ margin: 0, color: 'var(--text-dark)', fontSize: '0.9rem', lineHeight: '1.7' }}>{selectedPest.lifecycle}</p>
          </div>

          {/* Signs to Watch For */}
          <div className="card" style={{ gap: '12px', borderLeft: `4px solid ${getRiskColor(selectedPest.riskLevel)}` }}>
            <div style={{ fontWeight: 700, color: getRiskColor(selectedPest.riskLevel), fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Signs to Watch For in the Field</div>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {selectedPest.signs.map((sign, i) => (
                <li key={i} style={{ fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>{sign}</li>
              ))}
            </ul>
          </div>

          {/* Treatment */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: '16px' }}>
            {/* Biological */}
            <div className="card" style={{ gap: '10px', borderTop: '3px solid var(--status-low)' }}>
              <div style={{ fontWeight: 700, color: 'var(--status-low)', fontSize: '0.9rem' }}>🌿 Biological Controls (Eco-safe)</div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedPest.treatment.biological.map((t, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>{t}</li>)}
              </ul>
            </div>

            {/* Chemical */}
            <div className="card" style={{ gap: '10px', borderTop: '3px solid var(--accent-gold)' }}>
              <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '0.9rem' }}>🧪 Chemical Controls (PCPB Reg.)</div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedPest.treatment.chemical.map((t, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>{t}</li>)}
              </ul>
            </div>

            {/* Cultural */}
            <div className="card" style={{ gap: '10px', borderTop: '3px solid var(--primary-color)', gridColumn: 'span 1' }}>
              <div style={{ fontWeight: 700, color: 'var(--primary-color)', fontSize: '0.9rem' }}>🌱 Cultural & Preventive Practices</div>
              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedPest.treatment.cultural.map((t, i) => <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-dark)', lineHeight: '1.5' }}>{t}</li>)}
              </ul>
            </div>
          </div>

          <div style={{ background: 'var(--bg-input)', borderRadius: '10px', padding: '14px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6', border: '1px solid var(--border-color)' }}>
            ⚠️ <strong>Disclaimer:</strong> Always wear PPE when applying chemical controls. Rotate chemical classes to avoid resistance buildup. Consult a KALRO extension officer or Koppert Kenya agronomist for field-specific advice. Data based on KALRO, PCPB, and Koppert Kenya guidelines.
          </div>
        </div>
      )}

      {/* ── WEED REGULATION ── */}
      {activeSection === 'weeds' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ background: 'var(--bg-message-unread)', border: '1px solid var(--accent-gold)30' }}>
            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '6px' }}>📋 KALRO Weed Advisories</div>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: '1.6', margin: 0 }}>
              Herbicide recommendations sourced from KALRO and registered with PCPB.
              Always wear PPE and follow label instructions.
            </p>
          </div>

          {WEED_DATA.map(weed => {
            const isExpanded = expandedWeed === weed.id;
            return (
              <div key={weed.id} className="card" style={{ borderLeft: `4px solid ${getRiskColor(weed.riskLevel)}` }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flexShrink: 0, width: '100px', height: '75px', borderRadius: '10px', overflow: 'hidden', border: `2px solid ${getRiskColor(weed.riskLevel)}40` }}>
                    <img src={weed.illustration} alt={weed.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', color: 'var(--text-dark)', fontFamily: 'var(--font-header)', margin: '0 0 2px 0' }}>{weed.name}</h4>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>{weed.scientific}</div>
                      </div>
                      <span style={{ backgroundColor: `${getRiskColor(weed.riskLevel)}15`, color: getRiskColor(weed.riskLevel), padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${getRiskColor(weed.riskLevel)}30`, height: 'fit-content' }}>
                        {weed.riskLevel} Risk
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>Affected Crops: <strong>{weed.affectedCrops}</strong></div>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-dark)', lineHeight: '1.5', marginTop: '8px', marginBottom: 0 }}>{weed.description}</p>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-color)', marginBottom: '8px' }}>🌱 Cultural Control:</div>
                  <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {weed.cultural.map((c, i) => <li key={i} style={{ fontSize: '0.87rem', color: 'var(--text-dark)' }}>{c}</li>)}
                  </ul>
                </div>

                <button onClick={() => setExpandedWeed(isExpanded ? null : weed.id)}
                  style={{ alignSelf: 'flex-start', background: isExpanded ? 'var(--primary-color)' : 'none', border: '2px solid var(--primary-color)', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', color: isExpanded ? '#fff' : 'var(--primary-color)', fontWeight: 700, fontSize: '0.82rem', transition: 'var(--transition-smooth)' }}>
                  {isExpanded ? '▲ Hide Herbicide Guide' : '▼ PCPB Herbicide Guide'}
                </button>

                {isExpanded && (
                  <div style={{ background: 'var(--bg-input)', borderRadius: '10px', padding: '16px', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '10px', fontSize: '0.88rem' }}>🏛️ PCPB Registered Herbicides:</div>
                    {weed.herbicides.map((h, i) => (
                      <div key={i} style={{ padding: '10px 12px', marginBottom: '8px', background: 'var(--bg-card)', borderRadius: '8px', border: '1px solid var(--border-color)', borderLeft: '3px solid var(--accent-gold)' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '0.88rem' }}>{h.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>Rate: <strong>{h.rate}</strong></div>
                        <div style={{ fontSize: '0.76rem', color: 'var(--status-low)', marginTop: '3px', fontWeight: 600 }}>✓ {h.note}</div>
                      </div>
                    ))}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                      ⚠️ Wear PPE. Follow PCPB label directions. Avoid application before rain. Consult KALRO extension for field-rate advice.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PestAlertsTab;
