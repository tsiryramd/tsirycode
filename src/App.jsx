import { useState, useEffect } from 'react';
import { Plus, Briefcase, FileText, BookOpen, MessageSquare, Edit3, Archive, Trash2, ChevronRight, X } from 'lucide-react';
import { extractSkills, generateGuide, generateLessons, generateQA, generateFeedback as aiGenerateFeedback, regenerateJobContent } from './services/aiService';

const STORAGE_KEY = 'jobTrackerData';

const initialData = {
  cv: {
    profile: '',
    skills: '',
    experience: '',
    education: ''
  },
  jobs: [],
  notes: {}
};

function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialData;
  });
  
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCVModal, setShowCVModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    description: '',
    status: 'applique'
  });
  const [simulatorState, setSimulatorState] = useState({
    currentQuestion: 0,
    responses: [],
    feedback: null,
    active: false
  });

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const selectedJob = data.jobs.find(j => j.id === selectedJobId);

  const addJob = () => {
    if (!newJob.title || !newJob.company || !newJob.description) return;
    
    // Génération du contenu IA basé sur l'offre et le CV
    const job = {
      id: Date.now().toString(),
      ...newJob,
      createdAt: new Date().toISOString(),
      guide: generateGuide(newJob, data.cv),
      lessons: generateLessons(newJob, data.cv),
      qa: generateQA(newJob, data.cv),
      skills: extractSkills(newJob.description)
    };
    
    setData(prev => ({
      ...prev,
      jobs: [...prev.jobs, job],
      notes: { ...prev.notes, [job.id]: '' }
    }));
    
    setNewJob({ title: '', company: '', description: '', status: 'applique' });
    setShowAddModal(false);
  };

  const deleteJob = (id) => {
    setData(prev => ({
      ...prev,
      jobs: prev.jobs.filter(j => j.id !== id),
      notes: Object.fromEntries(Object.entries(prev.notes).filter(([k]) => k !== id))
    }));
    if (selectedJobId === id) setSelectedJobId(null);
  };

  const archiveJob = (id) => {
    setData(prev => ({
      ...prev,
      jobs: prev.jobs.map(j => j.id === id ? { ...j, status: 'archive' } : j)
    }));
  };

  const updateJobStatus = (id, status) => {
    setData(prev => ({
      ...prev,
      jobs: prev.jobs.map(j => j.id === id ? { ...j, status } : j)
    }));
  };

  const updateNotes = (notes) => {
    setData(prev => ({
      ...prev,
      notes: { ...prev.notes, [selectedJobId]: notes }
    }));
  };

  const updateCV = (cvData) => {
    // Mettre à jour le CV et régénérer le contenu IA pour toutes les offres
    const updatedJobs = data.jobs.map(job => ({
      ...job,
      ...regenerateJobContent(job, cvData)
    }));
    
    setData(prev => ({ 
      ...prev, 
      cv: cvData,
      jobs: updatedJobs
    }));
    setShowCVModal(false);
  };

  const getStatusLabel = (status) => {
    const labels = {
      applique: 'Postulé',
      telephone: 'Entretien téléphonique',
      premier: '1er entretien',
      deuxieme: '2ème entretien',
      troisieme: '3ème entretien',
      archive: 'Archivé'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status}`;
  };

  const filteredJobs = filterStatus === 'all' 
    ? data.jobs 
    : data.jobs.filter(j => j.status === filterStatus);

  const startSimulator = () => {
    setSimulatorState({
      currentQuestion: 0,
      responses: [],
      feedback: null,
      active: true
    });
  };

  const submitSimulatorResponse = (response) => {
    const feedback = aiGenerateFeedback(response, selectedJob.qa[simulatorState.currentQuestion], selectedJob, data.cv);
    setSimulatorState(prev => ({
      ...prev,
      responses: [...prev.responses, response],
      feedback
    }));
  };

  const nextQuestion = () => {
    if (simulatorState.currentQuestion < 4) {
      setSimulatorState(prev => ({
        ...prev,
        currentQuestion: prev.currentQuestion + 1,
        feedback: null
      }));
    } else {
      setSimulatorState(prev => ({ ...prev, active: false }));
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>JobTracker</h1>
        <p>Suivez vos candidatures et préparez vos entretiens</p>
      </header>

      <main className="main-content">
        <div className="dashboard-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <h2>Mon CV</h2>
            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', marginBottom: '1.5rem' }}
              onClick={() => setShowCVModal(true)}
            >
              <Edit3 size={16} />
              Modifier mon CV
            </button>

            <h2>Candidatures</h2>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginBottom: '1rem' }}
              onClick={() => setShowAddModal(true)}
            >
              <Plus size={16} />
              Nouvelle offre
            </button>

            <div className="filter-group">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                Toutes
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'applique' ? 'active' : ''}`}
                onClick={() => setFilterStatus('applique')}
              >
                Postulés
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'archive' ? 'active' : ''}`}
                onClick={() => setFilterStatus('archive')}
              >
                Archivés
              </button>
            </div>

            <div className="job-list">
              {filteredJobs.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📋</div>
                  <p>Aucune candidature</p>
                </div>
              ) : (
                filteredJobs.map(job => (
                  <div 
                    key={job.id}
                    className={`job-item ${selectedJobId === job.id ? 'selected' : ''}`}
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <div className="job-item-header">
                      <span className="job-company">{job.company}</span>
                      <span className={getStatusClass(job.status)}>
                        {getStatusLabel(job.status)}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {job.title}
                    </div>
                    <div className="job-date">
                      {new Date(job.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Main Content */}
          <section>
            {!selectedJob ? (
              <div className="card">
                <div className="empty-state">
                  <div className="empty-state-icon">🎯</div>
                  <h3>Sélectionnez une candidature</h3>
                  <p>Choisissez une offre dans la liste pour voir les détails et préparer votre entretien</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="card">
                  <div className="card-header">
                    <div>
                      <h2 className="card-title">{selectedJob.title}</h2>
                      <p className="card-subtitle">{selectedJob.company}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <select 
                        value={selectedJob.status}
                        onChange={(e) => updateJobStatus(selectedJob.id, e.target.value)}
                        className="form-select"
                        style={{ width: 'auto' }}
                      >
                        <option value="applique">Postulé</option>
                        <option value="telephone">Entretien téléphonique</option>
                        <option value="premier">1er entretien</option>
                        <option value="deuxieme">2ème entretien</option>
                        <option value="troisieme">3ème entretien</option>
                        <option value="archive">Archivé</option>
                      </select>
                      <button 
                        className="btn btn-sm btn-secondary"
                        onClick={() => archiveJob(selectedJob.id)}
                        title="Archiver"
                      >
                        <Archive size={16} />
                      </button>
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => deleteJob(selectedJob.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="tabs">
                    <button 
                      className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                      onClick={() => setActiveTab('overview')}
                    >
                      Vue d'ensemble
                    </button>
                    <button 
                      className={`tab ${activeTab === 'guide' ? 'active' : ''}`}
                      onClick={() => setActiveTab('guide')}
                    >
                      Guide entretien
                    </button>
                    <button 
                      className={`tab ${activeTab === 'lessons' ? 'active' : ''}`}
                      onClick={() => setActiveTab('lessons')}
                    >
                      Leçons
                    </button>
                    <button 
                      className={`tab ${activeTab === 'simulator' ? 'active' : ''}`}
                      onClick={() => setActiveTab('simulator')}
                    >
                      Simulateur
                    </button>
                    <button 
                      className={`tab ${activeTab === 'notes' ? 'active' : ''}`}
                      onClick={() => setActiveTab('notes')}
                    >
                      Notes
                    </button>
                  </div>

                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="tab-content active">
                      <div className="section-title">Description du poste</div>
                      <div style={{ 
                        background: 'var(--background)', 
                        padding: '1rem', 
                        borderRadius: '8px',
                        whiteSpace: 'pre-wrap',
                        lineHeight: '1.6'
                      }}>
                        {selectedJob.description}
                      </div>
                      
                      {data.cv.profile && (
                        <>
                          <div className="section-title" style={{ marginTop: '1.5rem' }}>Votre profil</div>
                          <div className="cv-section">
                            <h4>Profil</h4>
                            <p>{data.cv.profile}</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Guide Tab */}
                  {activeTab === 'guide' && (
                    <div className="tab-content active">
                      <div className="section-title">Guide de préparation</div>
                      <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--border)' }}>
                        <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
                          {selectedJob.guide?.introduction}
                        </p>
                        
                        <h4 style={{ marginBottom: '0.75rem' }}>Points clés à préparer:</h4>
                        <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                          {selectedJob.guide?.keyPoints.map((point, i) => (
                            <li key={i} style={{ marginBottom: '0.5rem' }}>{point}</li>
                          ))}
                        </ul>
                        
                        <div style={{ 
                          background: '#eff6ff', 
                          padding: '1rem', 
                          borderRadius: '8px',
                          borderLeft: '3px solid var(--primary)'
                        }}>
                          <strong>Recherche entreprise:</strong>
                          <p style={{ marginTop: '0.5rem' }}>{selectedJob.guide?.companyResearch}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lessons Tab */}
                  {activeTab === 'lessons' && (
                    <div className="tab-content active">
                      <div className="section-title">Leçons à maîtriser</div>
                      {selectedJob.lessons?.map(lesson => (
                        <div key={lesson.id} className="lesson-card">
                          <h4>{lesson.topic}</h4>
                          <p style={{ whiteSpace: 'pre-wrap' }}>{lesson.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Simulator Tab */}
                  {activeTab === 'simulator' && (
                    <div className="tab-content active">
                      {!simulatorState.active ? (
                        <div className="simulator-mode">
                          <h3>🎭 Simulateur d'entretien</h3>
                          <p>Entraînez-vous avec des questions types basées sur cette offre. Recevez des feedbacks instantanés.</p>
                          <button 
                            className="btn btn-secondary" 
                            style={{ marginTop: '1rem', background: 'white', border: 'none' }}
                            onClick={startSimulator}
                          >
                            Commencer l'entraînement
                          </button>
                        </div>
                      ) : (
                        <div>
                          <div className="sim-question">
                            <h4>Question {simulatorState.currentQuestion + 1}/5</h4>
                            <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                              {selectedJob.qa[simulatorState.currentQuestion]?.question}
                            </p>
                            <textarea 
                              className="sim-response"
                              placeholder="Tapez votre réponse..."
                              id="simResponse"
                            />
                            
                            {simulatorState.feedback && (
                              <div className="sim-feedback">
                                <h5>Score: {simulatorState.feedback.score}/100</h5>
                                <p>{simulatorState.feedback.comment}</p>
                              </div>
                            )}
                            
                            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                              {!simulatorState.feedback ? (
                                <button 
                                  className="btn btn-primary"
                                  onClick={() => {
                                    const response = document.getElementById('simResponse').value;
                                    if (response) submitSimulatorResponse(response);
                                  }}
                                >
                                  Évaluer ma réponse
                                </button>
                              ) : (
                                <button 
                                  className="btn btn-primary"
                                  onClick={nextQuestion}
                                >
                                  {simulatorState.currentQuestion < 4 ? 'Question suivante' : 'Terminer'}
                                </button>
                              )}
                              <button 
                                className="btn btn-secondary"
                                onClick={() => setSimulatorState(prev => ({ ...prev, active: false }))}
                              >
                                Annuler
                              </button>
                            </div>
                          </div>
                          
                          <div className="section-title" style={{ marginTop: '1.5rem' }}>Questions de référence</div>
                          {selectedJob.qa?.map((qa, index) => (
                            <div key={index} className="qa-item">
                              <div className="qa-question">{qa.question}</div>
                              <div className="qa-answer">{qa.answer}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes Tab */}
                  {activeTab === 'notes' && (
                    <div className="tab-content active">
                      <div className="section-title">Vos notes</div>
                      <textarea 
                        className="form-textarea notes-area"
                        placeholder="Prenez des notes pour cette candidature..."
                        value={data.notes[selectedJobId] || ''}
                        onChange={(e) => updateNotes(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Add Job Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Nouvelle candidature</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Intitulé du poste</label>
              <input 
                type="text" 
                className="form-input"
                value={newJob.title}
                onChange={e => setNewJob(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Développeur Full Stack"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Entreprise</label>
              <input 
                type="text" 
                className="form-input"
                value={newJob.company}
                onChange={e => setNewJob(prev => ({ ...prev, company: e.target.value }))}
                placeholder="Ex: TechCorp"
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Description de l'offre</label>
              <textarea 
                className="form-textarea"
                value={newJob.description}
                onChange={e => setNewJob(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Collez ici la description complète de l'offre..."
                style={{ minHeight: '200px' }}
              />
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Annuler</button>
              <button className="btn btn-primary" onClick={addJob}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* CV Modal */}
      {showCVModal && (
        <div className="modal-overlay" onClick={() => setShowCVModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Mon CV</h3>
              <button className="modal-close" onClick={() => setShowCVModal(false)}>×</button>
            </div>
            
            <div className="form-group">
              <label className="form-label">Profil / Résumé</label>
              <textarea 
                className="form-textarea"
                value={data.cv.profile}
                onChange={e => updateCV({ ...data.cv, profile: e.target.value })}
                placeholder="Décrivez votre profil professionnel en quelques lignes..."
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Compétences principales</label>
              <textarea 
                className="form-textarea"
                value={data.cv.skills}
                onChange={e => updateCV({ ...data.cv, skills: e.target.value })}
                placeholder="Listez vos compétences techniques et soft skills..."
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Expérience professionnelle</label>
              <textarea 
                className="form-textarea"
                value={data.cv.experience}
                onChange={e => updateCV({ ...data.cv, experience: e.target.value })}
                placeholder="Décrivez vos expériences les plus pertinentes..."
                style={{ minHeight: '150px' }}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Formation</label>
              <textarea 
                className="form-textarea"
                value={data.cv.education}
                onChange={e => updateCV({ ...data.cv, education: e.target.value })}
                placeholder="Vos diplômes et formations..."
              />
            </div>
            
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setShowCVModal(false)}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
