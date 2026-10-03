/* =====================================================================
   REPLACE BEFORE LAUNCH
   ---------------------------------------------------------------------
   Every value below that is a sample, a placeholder, or still needs to
   be confirmed by the founders:

   - siteUrl ............... "https://www.example.com" is a placeholder.
                             Also find-and-replace it in every .html file,
                             sitemap.xml and robots.txt (see README).
   - forms.endpoint ........ "https://formspree.io/f/YOUR_FORM_ID" is a
                             placeholder. Also find-and-replace it in the
                             form action="" attributes of join.html,
                             volunteer.html, contact.html and donate.html.
   - founders[2].bio ....... Shreyas's bio has not been written yet.
   - founders[*].photo ..... All founder photos are SVG placeholders
                             showing initials.
   - classes[*].topics ..... SAMPLE topics, to be confirmed.
   - classes[*].versions ... Telugu and English versions currently share
                             one time slot. Confirm, or edit each version's
                             day / timeIST separately.
   - classes "python" ...... gradeKey assumes Intro to Python is for 4th
                             and 5th graders. Confirm.
   - donations.totalReceived  null = hidden. Set a number (in rupees) only
                             if you want to show it.
   - socialLinks ........... empty = hidden.
   - testimonials .......... empty, and flags.showTestimonials is false.
                             Only add real quotes, first names only.
   - images ................ every image is a placeholder (hero, founders,
                             class icons, favicon, og-image).
   - Founders' story (about.html) first sentence needs founder
     confirmation. All Telugu text in js/translations.js is
     MACHINE-TRANSLATED and needs review by a native speaker.
   ===================================================================== */

(function () {
  'use strict';

  /* All image paths live here. Founders and classes reference these. */
  var images = {
    hero: 'images/hero.svg',
    favicon: 'images/favicon.svg',
    ogImage: 'images/og-image.png',
    founderRishita: 'images/founder-rishita.svg',
    founderSamatha: 'images/founder-samatha.svg',
    founderShreyas: 'images/founder-shreyas.svg',
    /* Keyed by class id (see `classes` below). */
    classIcons: {
      'math-4': 'images/class-math.svg',
      'math-5': 'images/class-math.svg',
      'science-4': 'images/class-science.svg',
      'science-5': 'images/class-science.svg',
      'python': 'images/class-python.svg'
    }
  };

  window.SITE_CONFIG = {
    orgName: 'Learn To Give',
    tagline: 'Learning that gives back.',
    mission: 'We offer free online tutoring for children in Hyderabad and Vijayawada, while raising donations for children who need specialized care.',

    /* Stored once. Used in the footer, Contact page and every mailto link. */
    contactEmail: 'info.learntogive@gmail.com',

    /* PLACEHOLDER. No trailing slash. Used for canonical and Open Graph URLs. */
    siteUrl: 'https://www.example.com',

    /* Example: [{ label: 'Instagram', url: 'https://instagram.com/yourhandle' }]
       The social section is hidden while this list is empty. */
    socialLinks: [],

    sadhana: {
      name: 'Sadhana Society for the Mentally Handicapped',
      shortName: 'Sadhana',
      url: 'https://sadhanawelfare.org/',
      description: 'Sadhana serves children with intellectual and developmental disabilities through a residential home and training center. Their funding goes toward specialized medical care, physical therapy equipment, and self-help training tools.'
    },

    stats: {
      studentsTaught: '50+',
      volunteerTutors: 6,
      classTypes: 5,
      startedMonthYear: 'July 2025',
      cities: ['Hyderabad', 'Vijayawada']
    },

    donations: {
      transferredToSadhanaINR: 19123,
      transferredApproxUSD: 'about $200',
      asOf: 'October 2026',
      totalReceived: null, /* number in rupees, or null to hide */
      lastUpdated: 'October 2026'
    },

    /* Adding an object here adds a founder card on the About page.
       `bio` stays in English in both languages until a real translation exists. */
    founders: [
      {
        name: 'Rishita Kantamneni',
        role: 'Cofounder and Science Lead',
        grade: 12,
        school: 'South Forsyth High School',
        bio: 'Rishita Kantamneni is a high school student with a strong interest in healthcare. She plans to continue her education in college and pursue advanced degrees in preparation for a career in medicine. Drawn to working with children, she hopes to specialize in pediatric neuroscience.',
        photo: images.founderRishita
      },
      {
        name: 'Samatha Gutta',
        role: 'Cofounder and Python Lead',
        grade: 12,
        school: 'South Forsyth High School',
        bio: 'Samatha Gutta is a high school student with a strong interest in computer science and data science. She plans to earn a college degree in the field and pursue a career in information management systems. Her goal is to apply technical skills to the way organizations manage and use information.',
        photo: images.founderSamatha
      },
      {
        name: 'Shreyas Jami',
        role: 'Cofounder and Math Lead',
        grade: 12,
        school: 'South Forsyth High School',
        bio: "[Shreyas's bio goes here]", /* REPLACE BEFORE LAUNCH */
        photo: images.founderShreyas
      }
    ],

    /* IST is the anchor time zone. Telugu and English versions default to the
       same slot but can be edited independently.
       usEasternNote: optional, internal reference only. It is never shown on
       family-facing pages. US clocks change seasonally, so it shifts. */
    classes: [
      {
        id: 'math-4',
        nameKey: 'class.math4.name',
        gradeKey: 'grade.4',
        subject: 'math',
        topics: ['Place value', 'Multiplication and division', 'Fractions', 'Word problems'], /* SAMPLE */
        durationMinutes: 60,
        signupOpen: true,
        usEasternNote: null,
        versions: [
          { language: 'Telugu', day: 'Saturday', timeIST: '6:00 PM to 7:00 PM' },
          { language: 'English', day: 'Saturday', timeIST: '6:00 PM to 7:00 PM' }
        ]
      },
      {
        id: 'math-5',
        nameKey: 'class.math5.name',
        gradeKey: 'grade.5',
        subject: 'math',
        topics: ['Decimals', 'Fraction operations', 'Order of operations', 'Volume'], /* SAMPLE */
        durationMinutes: 60,
        signupOpen: true,
        usEasternNote: null,
        versions: [
          { language: 'Telugu', day: 'Saturday', timeIST: '6:00 PM to 7:00 PM' },
          { language: 'English', day: 'Saturday', timeIST: '6:00 PM to 7:00 PM' }
        ]
      },
      {
        id: 'science-4',
        nameKey: 'class.science4.name',
        gradeKey: 'grade.4',
        subject: 'science',
        topics: ['Plants and animals', 'States of matter', 'Simple machines', 'Weather'], /* SAMPLE */
        durationMinutes: 60,
        signupOpen: true,
        usEasternNote: null,
        versions: [
          { language: 'Telugu', day: 'Saturday', timeIST: '8:00 PM to 9:00 PM' },
          { language: 'English', day: 'Saturday', timeIST: '8:00 PM to 9:00 PM' }
        ]
      },
      {
        id: 'science-5',
        nameKey: 'class.science5.name',
        gradeKey: 'grade.5',
        subject: 'science',
        topics: ['Ecosystems', 'Forces and motion', 'The solar system', 'The water cycle'], /* SAMPLE */
        durationMinutes: 60,
        signupOpen: true,
        usEasternNote: null,
        versions: [
          { language: 'Telugu', day: 'Saturday', timeIST: '8:00 PM to 9:00 PM' },
          { language: 'English', day: 'Saturday', timeIST: '8:00 PM to 9:00 PM' }
        ]
      },
      {
        id: 'python',
        nameKey: 'class.python.name',
        gradeKey: 'grade.4and5', /* ASSUMPTION: confirm who Intro to Python is for */
        subject: 'python',
        topics: ['Variables', 'Loops', 'If/else', 'Building small programs and games'], /* SAMPLE */
        durationMinutes: 60,
        signupOpen: true,
        usEasternNote: null,
        versions: [
          { language: 'Telugu', day: 'Sunday', timeIST: '6:00 PM to 7:00 PM' },
          { language: 'English', day: 'Sunday', timeIST: '6:00 PM to 7:00 PM' }
        ]
      }
    ],

    flags: {
      showTestimonials: false,
      showContactLanguageNote: true,
      showTeluguReviewNotice: true
    },

    /* Rendered on the Impact page only when flags.showTestimonials is true.
       Real quotes only, first names only, never photos of children.
       Shape: { quote: '...', name: 'First name', role: 'Parent' } */
    testimonials: [],

    forms: {
      /* PLACEHOLDER. Create a form at formspree.io and paste its endpoint here. */
      endpoint: 'https://formspree.io/f/YOUR_FORM_ID',
      /* Reference only: the notification address is set in the Formspree dashboard. */
      notifyEmail: 'info.learntogive@gmail.com'
    },

    images: images
  };
})();
