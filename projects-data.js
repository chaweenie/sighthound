// Project gallery data — one entry per folder in images/projects/<year>/<project>/
// `title` is a generic description of the work, not a client or street name.
// `type` is the category ('home' | 'apartment' | 'commercial') — 'home' and 'apartment' both
// render as residential-colored badges, labeled distinctly; 'commercial' renders as "Commercial".
// `scope` is 'renovation' | 'build'. Client/street names are intentionally omitted from display —
// only the title, year, category, and scope are shown publicly.
// Images with "before"/"after" in the filename are auto-paired into a single before/after slide
// (see buildSlides() in script.js) instead of appearing as separate carousel photos.
const PROJECTS = [
  {
    id: 'bc-cancer-society',
    title: 'Millwork Finish Match',
    year: 2026,
    type: 'commercial',
    scope: 'renovation',
    description: "Sourced matching panels and finished them to blend seamlessly with existing millwork — a small job where getting the finish exactly right was the whole challenge. The result: a wall that looks like it was never touched.",
    folder: 'images/projects/2026/BC Cancer Society',
    images: ['IMG_2329.jpeg'],
  },
  {
    id: 'beatty',
    title: 'Apartment Renovation',
    year: 2026,
    type: 'apartment',
    scope: 'renovation',
    description: "A downtown apartment refresh: old carpeting replaced with modern flooring and walls repainted, plus general repairs and handyman work completed alongside — leaving the unit looking clean, modern, and move-in ready.",
    folder: 'images/projects/2026/Beatty',
    images: ['IMG_1039.jpeg', 'IMG_1041.jpeg'],
  },
  {
    id: 'pokey-okey',
    title: 'Restaurant Millwork Build-Out',
    year: 2026,
    type: 'commercial',
    scope: 'renovation',
    description: "Built and installed custom cabinetry, wooden countertops, and millwork, and mounted signage, bringing the space fully to life and ready for opening day.",
    folder: 'images/projects/2026/Pokey Okey',
    images: ['IMG_1111.jpeg', 'IMG_1166.jpeg', 'IMG_1169.jpeg'],
  },
  {
    id: 'west-55',
    title: 'Basement Suite Addition',
    year: 2025,
    type: 'home',
    scope: 'renovation',
    description: "A basement remodel that added a full kitchen and extra living space for more usable square footage.",
    folder: 'images/projects/2025/West 55',
    images: ['IMG_4644.jpeg'],
  },
  {
    id: 'smith',
    title: 'Shed Loft Build',
    year: 2024,
    type: 'home',
    scope: 'renovation',
    description: "Converted an old shed into a cozy, comfortable loft space — extra square footage the client didn't have before.",
    folder: 'images/projects/2024/Smith',
    images: ['Smith Ave.jpeg'],
  },
  {
    id: 'bayridge',
    title: 'Concrete Home Build',
    year: 2023,
    type: 'home',
    scope: 'build',
    description: "Built in beautiful West Vancouver from 2018 to 2023, this 10,000 sq ft concrete home was built from the ground up. We managed the project end-to-end, delivering a strong concrete structure with a warm interior, clean modern lines, and thoughtful details throughout.",
    folder: 'images/projects/2023/bayridge',
    images: [
      'IMG_0028.jpeg', 'IMG_1833.jpeg', 'IMG_1834.jpeg', 'IMG_1969.jpeg',
      'IMG_2259.jpeg', 'IMG_2648.jpeg', 'IMG_2649.jpeg', 'IMG_3006.jpeg',
      'IMG_3356.jpeg', 'IMG_5083.jpeg', 'IMG_5102.jpeg', 'IMG_5103.jpeg',
      'IMG_5105.jpeg', 'IMG_5106.jpeg', 'IMG_5114.jpeg', 'IMG_5116.jpeg',
      'IMG_5371.jpeg', 'IMG_5372.jpeg', 'IMG_5375.jpeg', 'IMG_9798.jpeg',
      'IMG_9908.jpeg',
    ],
  },
  {
    id: 'charland',
    title: 'Storage & Paint Refresh',
    year: 2023,
    type: 'apartment',
    scope: 'renovation',
    description: "Custom laundry closet shelving for better organization, fresh paint in the bedroom and future nursery, and added shelving to make use of dead space in the bathroom — small changes that made the whole apartment feel more functional and modern.",
    folder: 'images/projects/2023/Charland',
    images: ['before.jpeg', 'IMG_3105.jpeg', 'IMG_4392.jpeg', 'IMG_7095.jpeg', 'after.jpeg'],
  },
  {
    id: 'mathers',
    title: 'Entry Door Renovation',
    year: 2014,
    type: 'home',
    scope: 'renovation',
    description: "Replaced the existing door and enlarged the entrance opening, opening up the entryway for easier, more comfortable access.",
    folder: 'images/projects/2014/Mathers',
    images: ['mathers_before.jpeg', 'Mathers_after.jpeg'],
  },
];
