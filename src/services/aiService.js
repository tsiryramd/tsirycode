/**
 * Service AI pour générer du contenu personnalisé
 * Utilise des templates intelligents basés sur le contexte
 */

// Liste étendue de compétences à détecter
const TECH_SKILLS = {
  frontend: ['React', 'Vue', 'Angular', 'Svelte', 'Next.js', 'Nuxt', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Sass', 'Webpack', 'Vite'],
  backend: ['Node.js', 'Python', 'Java', 'C#', '.NET', 'Go', 'Rust', 'PHP', 'Ruby', 'Django', 'Flask', 'FastAPI', 'Spring', 'Express', 'NestJS'],
  database: ['SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'MariaDB', 'SQLite', 'Oracle', 'Firebase'],
  cloud: ['AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI'],
  methods: ['Agile', 'Scrum', 'Kanban', 'DevOps', 'TDD', 'Clean Code', 'Microservices', 'REST API', 'GraphQL', 'gRPC']
};

const SOFT_SKILLS = [
  'leadership', 'communication', 'gestion', 'équipe', 'collaboration', 
  'autonomie', 'rigueur', 'créativité', 'innovation', 'analyse', 
  'synthèse', 'résolution', 'problèmes', 'adaptabilité', 'flexibilité'
];

/**
 * Extrait les compétences techniques d'une description
 */
export const extractSkills = (description) => {
  const foundSkills = [];
  const lowerDesc = description.toLowerCase();
  
  Object.values(TECH_SKILLS).flat().forEach(skill => {
    if (lowerDesc.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  
  // Détection soft skills
  SOFT_SKILLS.forEach(skill => {
    if (lowerDesc.includes(skill.toLowerCase())) {
      foundSkills.push(`Soft skill: ${skill}`);
    }
  });
  
  return [...new Set(foundSkills)]; // Remove duplicates
};

/**
 * Génère un guide d'entretien personnalisé basé sur l'offre et le CV
 */
export const generateGuide = (job, cv = {}) => {
  const skills = extractSkills(job.description);
  const techSkills = skills.filter(s => !s.includes('Soft skill'));
  const softSkills = skills.filter(s => s.includes('Soft skill'));
  
  // Personnalisation basée sur le CV
  const cvMatch = cv.skills ? findCVMatches(cv.skills, skills) : [];
  
  return {
    introduction: `Préparation pour le poste de ${job.title} chez ${job.company}. 
Cette offre met l'accent sur ${techSkills.slice(0, 3).join(', ') || 'les compétences techniques'}${softSkills.length > 0 ? ` et ${softSkills.length} soft skills` : ''}.
${cvMatch.length > 0 ? `Vos compétences en ${cvMatch.join(', ')} sont particulièrement pertinentes.` : ''}`,
    
    keyPoints: [
      `Comprendre la mission principale de ${job.company} et son secteur`,
      `Maîtriser les technologies clés: ${techSkills.slice(0, 5).join(', ') || 'à identifier'}`,
      softSkills.length > 0 ? `Préparer des exemples démontrant: ${softSkills.map(s => s.replace('Soft skill: ', '')).join(', ')}` : null,
      `Préparer des exemples concrets de réalisations (chiffrées si possible)`,
      `Anticiper les questions sur votre motivation pour ce poste spécifique`,
      cvMatch.length > 0 ? `Mettre en avant votre expérience en ${cvMatch[0]}` : null
    ].filter(Boolean),
    
    companyResearch: `Recherchez: 
• Valeurs et culture de ${job.company}
• Produits/services récents et actualités
• Concurrents directs et positionnement marché
• Technologies utilisées (Glassdoor, StackShare)
• Taille de l'entreprise et structure`,
    
    strengthsToHighlight: cvMatch.length > 0 
      ? `Vos points forts alignés: ${cvMatch.join(', ')}`
      : 'Identifiez 2-3 compétences de l\'offre que vous possédez'
  };
};

/**
 * Génère des leçons personnalisées pour chaque compétence requise
 */
export const generateLessons = (job, cv = {}) => {
  const skills = extractSkills(job.description);
  const cvSkills = cv.skills ? cv.skills.toLowerCase() : '';
  
  return skills.slice(0, 8).map((skill, index) => {
    const isMastered = cvSkills.includes(skill.toLowerCase());
    const category = getSkillCategory(skill);
    
    return {
      id: index,
      topic: skill,
      category: category,
      masteryLevel: isMastered ? 'confirmé' : 'à développer',
      content: generateLessonContent(skill, category, isMastered)
    };
  });
};

/**
 * Génère le contenu d'une leçon
 */
const generateLessonContent = (skill, category, isMastered) => {
  const baseContent = {
    technical: `Points clés à maîtriser pour ${skill}:
• Concepts fondamentaux et architecture
• Cas d'usage pratiques et meilleurs pratiques
• Pièges courants et comment les éviter
• Tendances actuelles et évolutions`,
    
    soft: `Développer ${skill}:
• Situations concrètes où vous avez fait preuve de cette compétence
• Résultats obtenus grâce à cette soft skill
• Comment vous l'avez développée
• Exemples à partager en entretien`,
    
    method: `Maîtriser ${skill}:
• Principes fondamentaux
• Mise en œuvre pratique
• Outils associés
• Bénéfices pour l'entreprise`
  };
  
  let content = baseContent.technical;
  if (category === 'soft') content = baseContent.soft;
  if (category === 'methods') content = baseContent.method;
  
  if (isMastered) {
    content += '\n\n✓ Vous maîtrisez déjà cette compétence - préparez des exemples concrets';
  } else {
    content += '\n\n⚠ À réviser - identifiez les concepts clés à comprendre';
  }
  
  return content;
};

/**
 * Catégorise une compétence
 */
const getSkillCategory = (skill) => {
  if (SOFT_SKILLS.some(s => skill.toLowerCase().includes(s))) return 'soft';
  if (TECH_SKILLS.methods.some(s => skill.toLowerCase().includes(s.toLowerCase()))) return 'methods';
  return 'technical';
};

/**
 * Trouve les correspondances entre CV et offre
 */
const findCVMatches = (cvSkills, jobSkills) => {
  const lowerCvSkills = cvSkills.toLowerCase();
  return jobSkills.filter(skill => 
    lowerCvSkills.includes(skill.toLowerCase())
  );
};

/**
 * Génère des questions/réponses personnalisées
 */
export const generateQA = (job, cv = {}) => {
  const skills = extractSkills(job.description);
  const topSkills = skills.slice(0, 4);
  
  const baseQuestions = [
    {
      question: "Parlez-moi de vous",
      answer: `Structurez en 3 parties:
1. Votre formation et début de carrière
2. Vos expériences les plus pertinentes pour CE poste
3. Pourquoi vous postulez chez ${job.company} maintenant

Durée: 2-3 minutes maximum`,
      type: 'intro'
    },
    {
      question: `Pourquoi voulez-vous travailler chez ${job.company}?`,
      answer: `Montrez que vous avez fait des recherches:
• Parlez de leurs produits/services qui vous intéressent
• Mentionnez leur culture ou valeurs qui vous correspondent
• Évoquez leurs défis ou projets récents
• Liez avec vos objectifs de carrière`,
      type: 'motivation'
    },
    {
      question: "Quelles sont vos forces?",
      answer: `Citez 2-3 forces PERTINENTES pour ce poste:
${topSkills.length > 0 ? `• Force technique: ${topSkills[0]} (avec exemple concret)` : '• Une compétence technique clé'}
• Une soft skill importante (communication, leadership...)
• Un trait personnel (rigueur, curiosité...)

Pour chaque force: donnez un exemple chiffré si possible`,
      type: 'strengths'
    },
    {
      question: "Pourquoi devrions-nous vous embaucher?",
      answer: `Argumentaire en 3 points:
1. Vos compétences correspondent exactement aux besoins (${topSkills.slice(0, 2).join(', ')})
2. Votre expérience apporte une valeur ajoutée immédiate
3. Votre motivation et fit culturel avec ${job.company}

Soyez concret et confiant sans être arrogant`,
      type: 'value'
    },
    {
      question: "Où vous voyez-vous dans 5 ans?",
      answer: `Montrez:
• Une ambition réaliste et alignée avec l'évolution possible
• Votre désir de monter en compétences (mentionnez ${topSkills[0] || 'une technologie clé'})
• Votre intérêt pour une évolution dans l'entreprise
• Évitez: "dans votre poste" ou "indépendant"`,
      type: 'projection'
    }
  ];
  
  // Questions techniques basées sur les compétences
  const technicalQuestions = topSkills.map(skill => ({
    question: `Pouvez-vous me parler de votre expérience avec ${skill}?`,
    answer: `Structure STAR:
• Situation: contexte du projet
• Tâche: votre responsabilité
• Action: ce que VOUS avez fait avec ${skill}
• Résultat: impact chiffré si possible

Préparez 2-3 exemples concrets par compétence clé`,
    type: 'technical'
  }));
  
  // Questions comportementales basées sur soft skills
  const softSkills = skills.filter(s => s.includes('Soft skill'));
  const behavioralQuestions = softSkills.slice(0, 2).map(skill => {
    const skillName = skill.replace('Soft skill: ', '');
    return {
      question: `Donnez-moi un exemple où vous avez fait preuve de ${skillName}`,
      answer: `Utilisez la méthode STAR:
• Décrivez le contexte précis
• Expliquez VOTRE rôle et actions
• Partagez le résultat obtenu
• Ce que vous en avez appris

Choisissez un exemple récent et pertinent`,
      type: 'behavioral'
    };
  });
  
  return [...baseQuestions, ...technicalQuestions, ...behavioralQuestions];
};

/**
 * Génère un feedback pour le simulateur
 */
export const generateFeedback = (response, question, job, cv = {}) => {
  const responseLength = response?.length || 0;
  const hasNumbers = /\d+/.test(response);
  const hasExamples = /(exemple|cas|situation|projet)/i.test(response);
  const mentionsCompany = job.company && response.toLowerCase().includes(job.company.toLowerCase());
  const cvMatches = cv.skills ? findCVMatches(cv.skills, extractSkills(job.description)) : [];
  const mentionsCV = cvMatches.some(match => response.toLowerCase().includes(match.toLowerCase()));
  
  let score = 50;
  const comments = [];
  
  // Longueur de la réponse
  if (responseLength < 50) {
    comments.push("Réponse trop courte - développez davantage");
  } else if (responseLength > 500) {
    comments.push("Réponse très complète mais attention à rester concis en entretien");
    score += 10;
  } else {
    comments.push("Bonne longueur de réponse");
    score += 15;
  }
  
  // Chiffres et exemples concrets
  if (hasNumbers) {
    comments.push("Excellent - vous utilisez des chiffres concrets");
    score += 15;
  } else {
    comments.push("Ajoutez des chiffres pour illustrer vos réalisations");
  }
  
  // Exemples
  if (hasExamples) {
    comments.push("Bien - vous donnez des exemples concrets");
    score += 10;
  }
  
  // Personnalisation entreprise
  if (mentionsCompany) {
    comments.push("Très bien - vous montrez votre intérêt pour l'entreprise");
    score += 10;
  }
  
  // Alignment CV
  if (mentionsCV) {
    comments.push(`Bon alignement avec vos compétences en ${cvMatches[0]}`);
    score += 10;
  }
  
  return {
    score: Math.min(100, score),
    comments,
    strengths: comments.filter(c => c.includes('Excellent') || c.includes('Bien') || c.includes('Très bien') || c.includes('Bon')),
    improvements: comments.filter(c => c.includes('trop') || c.includes('Ajoutez') || c.includes('attention'))
  };
};

/**
 * Met à jour tout le contenu IA quand une nouvelle offre est ajoutée
 */
export const regenerateJobContent = (job, cv = {}) => {
  return {
    guide: generateGuide(job, cv),
    lessons: generateLessons(job, cv),
    qa: generateQA(job, cv)
  };
};
