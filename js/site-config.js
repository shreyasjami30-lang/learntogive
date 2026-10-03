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
                             form action="" attributes of volunteer.html,
                             contact.html, donate.html and fundraise.html.
   - signupFormUrl ......... ON HOLD until the Google Form link is ready.
                             "[GOOGLE FORM URL]" is a placeholder. Until it
                             starts with https://, every "Sign Up" button
                             goes to contact.html instead.
   - feedbackFormUrl ....... ON HOLD until the Google Form link is ready.
                             "[FEEDBACK FORM URL]" is a placeholder. The
                             "Share your experience" button on the Impact
                             page stays hidden until it starts with https://.
   - classes[*].versions ... CONFIRMED by the founders (schedule, school
                             year, topics and FAQ answers). Tell the team
                             if anything changes. Each version's day and
                             timeIST can be edited on its own.
   - classes "python" ...... gradeKey assumes Intro to Python is for 4th
                             and 5th graders. Confirm.
   - founders[2].bio ....... Shreyas's bio is new. Confirm the wording.
   - founders[*].photo ..... All founder photos are SVG placeholders
                             showing initials.
   - Founders' story ....... about.story in js/translations.js is new.
                             Confirm the wording.
   - fundraiseHowItWorks ... Confirm this matches how you handle money
                             raised by fundraisers.
   - curriculumSamples ..... empty = the Classes page section is hidden.
                             Add real packet pages with student info
                             removed (see images/packets/README.md).
   - images.gallery ........ empty = the gallery is hidden.
   - donations.totalReceived  null = hidden. Set a number (in rupees) only
                             if you want to show it.
   - socialLinks ........... empty = hidden.
   - testimonials .......... empty, and flags.showTestimonials is false.
                             Only add real quotes, first names only.
   - images ................ hero, founders and class icons are
                             placeholders. The logo is direction A (see
                             images.logoMark).
   - All Telugu text in js/translations.js is MACHINE-TRANSLATED and needs
     review by a native speaker.
   ===================================================================== */

(function () {
  'use strict';

  /* All image paths live here. Founders and classes reference these. */
  var images = {
    /* The logo mark (icon only). The wordmark next to it is live HTML text.
       To switch logos, change this ONE line to one of:
         'images/logo-mark.svg'          A. book whose pages curve into a heart (current)
         'images/logo-mark-pencil.svg'   B. pencil whose eraser end is a heart
         'images/logo-mark-sunrise.svg'  C. sun rising over an open book
       Then rebuild the favicon and share images (README "Swap the logo"). */
    logoMark: 'images/logo-mark.svg',
    hero: 'images/hero.svg',
    favicon: 'images/favicon.svg',
    ogImage: 'images/og-image.png',
    appleTouchIcon: 'images/apple-touch-icon.png',
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
    },
    /* Photos for the Classes page gallery. The gallery is left out of the page
       while this list is empty. Never use photos of children.
       Shape: { src: 'images/gallery/tutors-planning.jpg', alt: 'Describe the photo',
                caption: 'Short caption', width: 1200, height: 800 }
       width and height are the image's real pixel size (prevents layout jumps). */
    gallery: []
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
       Duplicate a card by adding an entry to the founders list (copy one
       object below and change its values).
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
        bio: 'Shreyas Jami is a high school student with a strong interest in finance and investing. He plans to study business in college and pursue a career in investments and portfolio management. As Math Lead, he helps run the math classes. He also keeps the records for donations to Sadhana.',
        photo: images.founderShreyas
      }
    ],

    /* Classes are year-long and follow the Indian school year. Confirmed. */
    schoolYear: { start: 'June', end: 'April', status: 'confirmed' },

    /* Every class has a Telugu and an English version, each with its own time.
       Schedule confirmed by the founders. All times are IST.
         Slot A: Saturdays 6:00 PM to 7:00 PM
         Slot B: Saturdays 8:00 PM to 9:00 PM
       Rule: the English version of one subject meets at the same time as the
       Telugu version of the other subject, then they trade. A student who
       takes math and science in the same language never has a clash.
       Check it by hand after any edit.

       Fields:
         focus ....... optional focus area shown on the card (null = none).
         signupUrl ... optional per-class Google Form; falls back to
                       signupFormUrl below. Only used when it starts with https://.
         usEasternNote optional, internal reference only. Never shown on
                       family-facing pages. US clocks change seasonally. */
    scheduleStatus: 'confirmed',
    classes: [
      {
        id: 'math-4',
        nameKey: 'class.math4.name',
        gradeKey: 'grade.4',
        subject: 'math',
        focus: null,
        topics: ['Place value', 'Multiplication and division', 'Fractions', 'Word problems'],
        durationMinutes: 60,
        signupOpen: true,
        signupUrl: null,
        usEasternNote: null,
        versions: [
          { language: 'Telugu', day: 'Saturday', timeIST: '6:00 PM to 7:00 PM' },  /* Slot A */
          { language: 'English', day: 'Saturday', timeIST: '8:00 PM to 9:00 PM' }  /* Slot B */
        ]
      },
      {
        id: 'math-5',
        nameKey: 'class.math5.name',
        gradeKey: 'grade.5',
        subject: 'math',
        focus: null,
        topics: ['Decimals', 'Fraction operations', 'Order of operations', 'Volume'],
        durationMinutes: 60,
        signupOpen: true,
        signupUrl: null,
        usEasternNote: null,
        versions: [
          { language: 'Telugu', day: 'Saturday', timeIST: '6:00 PM to 7:00 PM' },  /* Slot A */
          { language: 'English', day: 'Saturday', timeIST: '8:00 PM to 9:00 PM' }  /* Slot B */
        ]
      },
      {
        id: 'science-4',
        nameKey: 'class.science4.name',
        gradeKey: 'grade.4',
        subject: 'science',
        focus: 'Environmental Science',
        topicsStatus: 'confirmed',
        topics: ['Natural resources', 'Water and the water cycle', 'Air and weather', 'Soil and land', 'Pollution and waste', 'Recycling and conservation', 'Energy sources'],
        durationMinutes: 60,
        signupOpen: true,
        signupUrl: null,
        usEasternNote: null,
        versions: [
          { language: 'English', day: 'Saturday', timeIST: '6:00 PM to 7:00 PM' },  /* Slot A */
          { language: 'Telugu', day: 'Saturday', timeIST: '8:00 PM to 9:00 PM' }   /* Slot B */
        ]
      },
      {
        id: 'science-5',
        nameKey: 'class.science5.name',
        gradeKey: 'grade.5',
        subject: 'science',
        focus: 'Life Science',
        topicsStatus: 'confirmed',
        topics: ['Plant and animal structures', 'Life cycles', 'Food chains and food webs', 'Habitats and adaptations', 'Human body systems', 'Health and nutrition'],
        durationMinutes: 60,
        signupOpen: true,
        signupUrl: null,
        usEasternNote: null,
        versions: [
          { language: 'English', day: 'Saturday', timeIST: '6:00 PM to 7:00 PM' },  /* Slot A */
          { language: 'Telugu', day: 'Saturday', timeIST: '8:00 PM to 9:00 PM' }   /* Slot B */
        ]
      },
      {
        id: 'python',
        nameKey: 'class.python.name',
        gradeKey: 'grade.4and5', /* ASSUMPTION: confirm who Intro to Python is for */
        subject: 'python',
        focus: null,
        topics: ['Variables', 'Loops', 'If/else', 'Building small programs and games'],
        durationMinutes: 60,
        signupOpen: true,
        signupUrl: null,
        usEasternNote: null,
        versions: [
          { language: 'English', day: 'Sunday', timeIST: '6:00 PM to 7:00 PM' },
          { language: 'Telugu', day: 'Sunday', timeIST: '8:00 PM to 9:00 PM' }
        ]
      }
    ],

    /* PLACEHOLDER. The Google Form parents use to sign up. A value counts as
       real only when it starts with https://. Until then every "Sign Up"
       button goes to contact.html, so no link is broken. */
    signupFormUrl: '[GOOGLE FORM URL]',

    /* PLACEHOLDER. Google Form for parents, students and tutors to share
       their experience (first name only, with a permission-to-publish
       checkbox). The Impact page button is hidden until it starts with https://. */
    feedbackFormUrl: '[FEEDBACK FORM URL]',

    /* All communication with students, parents and tutors happens on our
       Discord server. Families get access only after their sign-up is
       processed, so there is never a public invite link on the site.
       enabled: false hides every Discord mention. */
    discord: { enabled: true },

    /* "A look inside our curriculum packets" on the Classes page. The whole
       section stays out of the page while this list is empty.
       Only real pages with every bit of student information removed.
       Shape: { classId: 'math-4', title: 'Fractions practice page',
                description: 'One sentence.', previewImage: 'images/packets/math-4-fractions.png',
                fileUrl: 'images/packets/math-4-fractions.pdf' } */
    curriculumSamples: [],

    /* Fundraise page. Ideas for people in the US raising money for Sadhana. */
    fundraiseIdeas: [
      { title: 'School clubs and student groups', examples: 'Bake sales, spirit days' },
      { title: 'Cultural and community associations', examples: 'Events, food stalls' },
      { title: 'Temples and community centers', examples: 'A collection at a festival or gathering' },
      { title: 'Local restaurants and shops', examples: "A share-of-sales night, with the owner's permission" },
      { title: 'Garage, book, or plant sales', examples: null },
      { title: 'Walkathons, sports tournaments, or talent shows', examples: null }
    ],
    /* CONFIRM: how fundraiser money is handled. Shown on fundraise.html. */
    fundraiseHowItWorks: {
      text: 'Tell us your idea using the form below. A founder will reply with next steps. Money raised is handled the same way as donations: a founder records it and we pass the full amount to Sadhana.',
      status: 'confirm'
    },

    flags: {
      showTestimonials: false,
      showContactLanguageNote: true,
      showTeluguReviewNotice: true
    },

    /* Rendered on the Impact page only when flags.showTestimonials is true.
       Real quotes only, collected with permission to publish (feedbackFormUrl).
       First names only (anything after the first word is dropped), never
       photos of children.
       Shape: { quote: '...', name: 'First name', role: 'Parent' }
       role is one of 'Parent', 'Student', 'Tutor'. */
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
