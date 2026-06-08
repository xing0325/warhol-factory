/* ============================================================
   WORKS DATA — real Warhol pieces for the study gallery.
   Images hotlinked from public archives (verified resolving).
   Where no free image exists, `fallback` renders a generated
   stand-in (labelled "representation"). Educational use.
   ============================================================ */

export const WORKS = [
  {
    id:'soup-cans', title:"Campbell's Soup Cans", year:'1962',
    medium:'Casein, metallic paint & pencil on 32 canvases, 51 × 41 cm each',
    collection:'Museum of Modern Art (MoMA), New York',
    note:"32 hand-painted canvases — one for each variety Campbell's sold at the time — first shown in 1962 at the Ferus Gallery, Los Angeles. A canonical icon of Pop art; MoMA acquired the complete set in 1996.",
    img:'https://upload.wikimedia.org/wikipedia/commons/a/a3/Campbell%27s_Soup_Cans_by_Andy_Warhol.jpg',
    src:"https://en.wikipedia.org/wiki/Campbell's_Soup_Cans", fallback:'soup'
  },
  {
    id:'marilyn-diptych', title:'Marilyn Diptych', year:'1962',
    medium:'Silkscreen ink & acrylic on canvas, 205 × 290 cm',
    collection:'Tate, London',
    note:"Made within months of Marilyn Monroe's death in August 1962, repeating a publicity still from the 1953 film Niagara fifty times — vivid colour on the left fading to worn black-and-white on the right. A meditation on celebrity and mortality.",
    img:'https://upload.wikimedia.org/wikipedia/en/8/87/Marilyndiptych.jpg',
    src:'https://en.wikipedia.org/wiki/Marilyn_Diptych', fallback:'face'
  },
  {
    id:'gold-marilyn', title:'Gold Marilyn Monroe', year:'1962',
    medium:'Silkscreen ink on synthetic polymer paint on canvas, 211 × 145 cm',
    collection:'Museum of Modern Art (MoMA), New York',
    note:'A single silkscreened Monroe floating in a vast gold field — the only Marilyn for which Warhol used gold. The composition evokes a religious icon, framing the late actress as a secular saint.',
    img:'https://upload.wikimedia.org/wikipedia/en/c/ca/Warhol_-_Gold_Marilyn_Monroe_%281962%29.jpg',
    src:'https://en.wikipedia.org/wiki/Gold_Marilyn_Monroe', fallback:'face'
  },
  {
    id:'dollar-bills', title:'200 One Dollar Bills', year:'1962',
    medium:'Silkscreen ink & pencil on canvas, 204 × 234 cm',
    collection:'Private collection (Sotheby’s, 2009 — $43.8m)',
    note:'Among Warhol’s earliest silkscreens: a hand-drawn dollar bill repeated in a 20×10 grid, treating money itself as a mass-produced image. (Under copyright — shown here as a generated representation.)',
    img:'', src:'https://en.wikipedia.org/wiki/Andy_Warhol', fallback:'dollar'
  },
  {
    id:'liz', title:'Liz #3 [Early Colored Liz]', year:'1963',
    medium:'Acrylic & silkscreen ink on linen, 102 × 102 cm',
    collection:'The Art Institute of Chicago',
    note:'One of thirteen canvases of Elizabeth Taylor before jewel-toned grounds, silkscreened from a publicity photo for her 1960 film Butterfield 8.',
    img:'https://www.artic.edu/iiif/2/362c0c2a-4576-2207-4ba9-2b87e6d0bad0/full/843,/0/default.jpg',
    src:'https://www.artic.edu/artworks/229406/liz-3-early-colored-liz', fallback:'face'
  },
  {
    id:'triple-elvis', title:'Triple Elvis [Ferus Type]', year:'1963',
    medium:'Silkscreen ink, acrylic & silver paint on canvas, 208 × 175 cm',
    collection:'Private collection (Christie’s, 2014 — ~$81.9m)',
    note:'Three overlapping, ghosted images of Elvis Presley in a gunslinger stance, drawn from a publicity still for the 1960 Western Flaming Star. First shown at the Ferus Gallery, Los Angeles.',
    img:'https://upload.wikimedia.org/wikipedia/en/9/98/Triple-Elvis-by-Andy-Warhol.jpg',
    src:'https://en.wikipedia.org/wiki/Triple_Elvis', fallback:'face'
  },
  {
    id:'flowers', title:'Flowers', year:'1964',
    medium:'Acrylic & silkscreen ink on canvas',
    collection:'First shown at Leo Castelli Gallery, New York',
    note:'Square canvases of four flat hibiscus blossoms against a dark grassy ground, based on a photograph by Patricia Caulfield (which led to a 1966 copyright settlement).',
    img:'https://upload.wikimedia.org/wikipedia/en/5/54/Andy-Warhol-Flowers-1964.jpeg',
    src:'https://en.wikipedia.org/wiki/Flowers_(Warhol)', fallback:'flower'
  },
  {
    id:'shot-marilyns', title:'Shot Marilyns', year:'1964',
    medium:'Acrylic & silkscreen ink on linen, 102 × 102 cm each (five canvases)',
    collection:'Dispersed (Shot Sage Blue Marilyn — Christie’s 2022, $195m)',
    note:'Five 40-inch Marilyns in different colour schemes. The name comes from a 1964 Factory incident when Dorothy Podber fired a pistol through a stack of four; the repaired works became the “Shot” Marilyns.',
    img:'https://upload.wikimedia.org/wikipedia/en/0/0c/Andy_Warhol_Shot_Marilyns_1964.jpg',
    src:'https://en.wikipedia.org/wiki/Shot_Marilyns', fallback:'face'
  },
  {
    id:'brillo', title:'Brillo Boxes', year:'1964',
    medium:'Silkscreen ink & house paint on plywood, ~43 × 43 × 36 cm each',
    collection:'The Andy Warhol Museum & others',
    note:'Life-size plywood replicas of Brillo soap-pad cartons, silkscreened to mimic the 1961 package design by James Harvey; ~400 were stacked at the Stable Gallery in 1964, collapsing product into art object. (Generated representation.)',
    img:'', src:'https://en.wikipedia.org/wiki/Brillo_Boxes', fallback:'soup'
  },
  {
    id:'self-66', title:'Self-Portrait', year:'1966',
    medium:'Silkscreen ink & acrylic on canvas (multi-canvas grids)',
    collection:'MoMA · Art Institute of Chicago · The Broad',
    note:'A brooding, hand-to-chin photobooth image repeated and recoloured across grids — Warhol turning his own face into a mass-reproduced Pop subject. (Under copyright — generated representation.)',
    img:'', src:'https://www.moma.org/collection/works/79889', fallback:'face'
  },
  {
    id:'vu-nico', title:'The Velvet Underground & Nico', year:'1967',
    medium:'Screenprinted LP cover; early pressings had a peelable banana',
    collection:'Verve Records · cover by Andy Warhol',
    note:'Warhol’s debut-LP cover for the band at the heart of his Exploding Plastic Inevitable. Early pressings said “Peel slowly and see” — lift the banana skin to reveal pink fruit beneath.',
    img:'https://upload.wikimedia.org/wikipedia/en/0/0c/Velvet_Underground_and_Nico.jpg',
    src:'https://en.wikipedia.org/wiki/The_Velvet_Underground_%26_Nico', fallback:'banana'
  },
  {
    id:'electric-chair', title:'Big Electric Chair', year:'1967–68',
    medium:'Silkscreen ink & acrylic on canvas, 137 × 185 cm',
    collection:'Froehlich Collection · AIC · The Broad · Menil',
    note:'From the Death and Disaster series: an enlarged, empty electric chair at Sing Sing, a press photograph turned into a stark meditation on capital punishment and mortality.',
    img:'https://upload.wikimedia.org/wikipedia/en/4/4b/Bigelectricchair.jpg',
    src:'https://en.wikipedia.org/wiki/Big_Electric_Chair', fallback:'dollar'
  },
  {
    id:'mao', title:'Mao', year:'1972',
    medium:'Acrylic, silkscreen ink & pencil on linen; up to 448 × 347 cm',
    collection:'The Art Institute of Chicago · The Met · worldwide',
    note:'A series of 199 portraits based on the frontispiece of Mao’s “Little Red Book,” made after Nixon’s 1972 visit to China — propaganda image overlaid with painterly, almost cosmetic colour. (Under copyright — generated representation.)',
    img:'', src:'https://en.wikipedia.org/wiki/Mao_(Warhol)', fallback:'face'
  },
  {
    id:'fright-wig', title:'Self-Portrait (Fright Wig)', year:'1986',
    medium:'Acrylic & silkscreen ink on canvas, up to 203 × 203 cm',
    collection:'Tate & National Galleries of Scotland (d’Offay Donation)',
    note:'Warhol’s last great self-portrait: a spectral, disembodied head under a wild electrified “fright wig,” completed months before his death in 1987. (Under copyright — generated representation.)',
    img:'', src:'https://www.tate.org.uk/art/artworks/warhol-self-portrait-with-fright-wig-ar00312', fallback:'face'
  }
];
