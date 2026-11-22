import { useState, useEffect } from 'react'
import { supabase } from './supabase'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')

  const [courses, setCourses] = useState([])
  const [faculties, setFaculties] = useState([])
  const [programmes, setProgrammes] = useState([])

  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingFaculties, setLoadingFaculties] = useState(true)
  const [loadingProgrammes, setLoadingProgrammes] = useState(true)


  const [selectedFaculty, setSelectedFaculty] = useState(null)
  const [selectedProgramme, setSelectedProgramme] = useState(null)
  const [combinations, setCombinations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')


  // COURSE UNITS STATES
  const [unitProgramme, setUnitProgramme] = useState('')
  const [unitYear, setUnitYear] = useState('1')
  const [unitSemester, setUnitSemester] = useState('1')
  const [courseUnits, setCourseUnits] = useState([])
  const [loadingUnits, setLoadingUnits] = useState(false)
  const [unitError, setUnitError] = useState('')


  // STUDY NOTES STATES
  const [studyNotes, setStudyNotes] = useState([])
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [notesError, setNotesError] = useState('')
  const [notesSearch, setNotesSearch] = useState('')
  const [selectedNote, setSelectedNote] = useState(null)


  // Load courses
  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase
        .from('courses')
        .select('*')

      if (error) {
        console.error('Error fetching courses:', error)
      } else {
        setCourses(data || [])
      }

      setLoadingCourses(false)
    }


    fetchCourses()
  }, [])


  // Load faculties
  useEffect(() => {
    async function fetchFaculties() {
      const { data, error } = await supabase
        .from('faculties')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching faculties:', error)
      } else {
        setFaculties(data || [])
      }

      setLoadingFaculties(false)
    }


    fetchFaculties()
  }, [])


  // Load programmes
  useEffect(() => {
    async function fetchProgrammes() {
      const { data, error } = await supabase
        .from('programmes')
        .select('*')
        .order('name')

      if (error) {
        console.error('Error fetching programmes:', error)
      } else {
        setProgrammes(data || [])
      }

      setLoadingProgrammes(false)
    }


    fetchProgrammes()
  }, [])


  // Load subject combinations for selected programme
  useEffect(() => {
    async function fetchCombinations() {
      if (!selectedProgramme) {
        setCombinations([])
        return
      }

      const { data, error } = await supabase
        .from('programme_combinations')
        .select('*')
        .eq('programme_id', selectedProgramme.id)
        .order('combination_type')
        .order('combination_name')

      if (error) {
        console.error('Error fetching combinations:', error)
        setCombinations([])
      } else {
        setCombinations(data || [])
      }
    }


    fetchCombinations()
  }, [selectedProgramme])


  // Load course units when programme, year or semester changes
  useEffect(() => {
    async function fetchCourseUnits() {
      if (activePage !== 'Course Units' || !unitProgramme) {
        setCourseUnits([])
        setUnitError('')
        return
      }

      setLoadingUnits(true)
      setUnitError('')

      const { data, error } = await supabase
        .from('course_units')
        .select('*')
        .eq('programme_id', unitProgramme)
        .eq('year_of_study', Number(unitYear))
        .eq('semester', Number(unitSemester))
        .order('unit_code')

      if (error) {
        console.error('Error fetching course units:', error)
        setUnitError(error.message)
        setCourseUnits([])
      } else {
        setCourseUnits(data || [])
      }

      setLoadingUnits(false)
    }


    fetchCourseUnits()
  }, [activePage, unitProgramme, unitYear, unitSemester])


  // Load study notes from Supabase
  useEffect(() => {
    async function fetchStudyNotes() {
      if (activePage !== 'Study Notes') {
        setSelectedNote(null)
        return
      }

      setLoadingNotes(true)
      setNotesError('')

      const { data, error } = await supabase
        .from('course_unit_notes')
        .select('*, course_units(unit_code, unit_title, year_of_study, semester)')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching study notes:', error)
        setNotesError(error.message)
        setStudyNotes([])
      } else {
        setStudyNotes(data || [])
      }

      setLoadingNotes(false)
    }


    fetchStudyNotes()
  }, [activePage])


  const menuItems = [
    'Dashboard',
    'My Courses',
    'Faculties',
    'Course Units',
    'Study Notes',
    'Quizzes',
    'Past Papers',
    'Profile',
    'Settings'
  ]


  const pageContent = {
    Dashboard: 'Welcome to CampusLearn. Your university learning journey starts here.',
    'My Courses': 'Access your university units and courses.',
    Faculties: 'Explore faculties and academic programmes.',
    'Course Units': 'Browse course units by programme, year and semester.',
    'Study Notes': 'Read and organize your study notes.',
    Quizzes: 'Practice questions and test your knowledge.',
    'Past Papers': 'Prepare for examinations using past papers.',
    Profile: 'View your student profile.',
    Settings: 'Manage your CampusLearn settings.'
  }


  const facultyProgrammes = programmes.filter(programme =>
    programme.faculty_id === selectedFaculty?.id &&
    (
      programme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (programme.qualification_level || '')
        .toLowerCase().includes(searchTerm.toLowerCase())
    )
  )


  const sortedProgrammes = [...programmes].sort((a, b) =>
    a.name.localeCompare(b.name)
  )


  const filteredStudyNotes = studyNotes.filter(note => {
    const search = notesSearch.toLowerCase()
    const unitTitle = note.course_units?.unit_title || ''
    const unitCode = note.course_units?.unit_code || ''

    return (
      (note.title || '').toLowerCase().includes(search) ||
      (note.content || '').toLowerCase().includes(search) ||
      unitTitle.toLowerCase().includes(search) ||
      unitCode.toLowerCase().includes(search)
    )
  })


  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      background: '#f1f5f9'
    }}>

      {/* SIDEBAR */}
      <aside style={{
        width: '250px',
        minWidth: '250px',
        background: '#0f172a',
        color: 'white',
        padding: '25px 15px'
      }}>
        <h2 style={{ marginBottom: '30px' }}>
          📚 CampusLearn
        </h2>


        {menuItems.map(item => (
          <button
            key={item}
            onClick={() => {
              setActivePage(item)
              setSelectedFaculty(null)
              setSelectedProgramme(null)
              setSearchTerm('')
              setNotesSearch('')
              setSelectedNote(null)
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '14px',
              marginBottom: '8px',
              textAlign: 'left',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              color: 'white',
              background: activePage === item
                ? '#2563eb'
                : 'transparent'
            }}
          >
            {item}
          </button>
        ))}
      </aside>


      {/* MAIN CONTENT */}
      <main style={{
        flex: 1,
        padding: '35px',
        minWidth: 0
      }}>

        <h1 style={{ color: '#0f172a' }}>
          {activePage}
        </h1>


        <p style={{ marginTop: '12px', color: '#64748b' }}>
          {pageContent[activePage]}
        </p>


        {/* DASHBOARD */}
        {activePage === 'Dashboard' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}>
            {[
              ['📖', 'My Courses'],
              ['🎓', 'Faculties'],
              ['📚', 'Course Units'],
              ['📝', 'Study Notes'],
              ['🧠', 'Quizzes'],
              ['📄', 'Past Papers']
            ].map(([icon, title]) => (
              <div
                key={title}
                onClick={() => setActivePage(title)}
                style={{
                  background: 'white',
                  padding: '25px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.05)'
                }}
              >
                <h2>{icon}</h2>
                <h3 style={{ marginTop: '12px' }}>
                  {title}
                </h3>
                <p style={{ marginTop: '8px', color: '#64748b' }}>
                  Open {title}
                </p>
              </div>
            ))}
          </div>
        )}


        {/* MY COURSES */}
        {activePage === 'My Courses' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '30px'
          }}>
            {loadingCourses ? (
              <p>Loading courses...</p>
            ) : courses.length === 0 ? (
              <p>No courses available yet.</p>
            ) : (
              courses.map(course => (
                <div
                  key={course.id}
                  style={{
                    background: 'white',
                    padding: '25px',
                    borderRadius: '12px'
                  }}
                >
                  <h2>📚</h2>
                  <h3>{course.title}</h3>
                  <p style={{
                    color: '#64748b',
                    marginTop: '10px'
                  }}>
                    {course.description}
                  </p>
                </div>
              ))
            )}
          </div>
        )}


        {/* FACULTIES AND PROGRAMMES */}
        {activePage === 'Faculties' && (
          <>
            {!selectedFaculty ? (
              <>
                <h2 style={{ marginTop: '30px' }}>
                  CUEA Academic Units
                </h2>


                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                  gap: '20px',
                  marginTop: '20px'
                }}>
                  {loadingFaculties ? (
                    <p>Loading academic units...</p>
                  ) : faculties.length === 0 ? (
                    <p>No academic units found.</p>
                  ) : (
                    faculties.map(faculty => (
                      <div
                        key={faculty.id}
                        onClick={() => {
                          setSelectedFaculty(faculty)
                          setSearchTerm('')
                        }}
                        style={{
                          background: 'white',
                          padding: '25px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          boxShadow: '0 3px 12px rgba(0,0,0,0.05)'
                        }}
                      >
                        <h2>🎓</h2>
                        <h3>{faculty.name}</h3>
                        <p style={{
                          color: '#2563eb',
                          marginTop: '12px'
                        }}>
                          View programmes →
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : selectedProgramme ? (
              <>
                <button
                  onClick={() => setSelectedProgramme(null)}
                  style={{
                    marginTop: '25px',
                    padding: '10px 18px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to programmes
                </button>


                <h2 style={{ marginTop: '25px' }}>
                  {selectedProgramme.name}
                </h2>


                <p style={{
                  color: '#64748b',
                  marginTop: '8px'
                }}>
                  Subject combinations
                </p>


                {combinations.length === 0 ? (
                  <p style={{ marginTop: '20px' }}>
                    No subject combinations are currently listed
                    for this programme.
                  </p>
                ) : (
                  <>
                    <h3 style={{ marginTop: '25px' }}>
                      {combinations.length} subject combinations
                    </h3>


                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '16px',
                      marginTop: '20px'
                    }}>
                      {combinations.map(combination => (
                        <div
                          key={combination.id}
                          style={{
                            background: 'white',
                            padding: '20px',
                            borderRadius: '12px',
                            boxShadow: '0 3px 12px rgba(0,0,0,0.05)'
                          }}
                        >
                          <h3>{combination.combination_name}</h3>

                          <p style={{
                            color: '#2563eb',
                            marginTop: '8px',
                            fontWeight: 'bold'
                          }}>
                            {combination.combination_type}
                          </p>

                          {combination.description && (
                            <p style={{
                              color: '#64748b',
                              marginTop: '10px',
                              fontSize: '13px'
                            }}>
                              {combination.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setSelectedFaculty(null)
                    setSelectedProgramme(null)
                    setSearchTerm('')
                  }}
                  style={{
                    marginTop: '25px',
                    padding: '10px 18px',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#2563eb',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Academic Units
                </button>


                <h2 style={{ marginTop: '25px' }}>
                  {selectedFaculty.name}
                </h2>


                <p style={{
                  color: '#64748b',
                  marginTop: '8px'
                }}>
                  Explore the programmes offered by this academic unit.
                </p>


                <input
                  type="text"
                  placeholder="Search programmes..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    maxWidth: '500px',
                    padding: '14px',
                    marginTop: '20px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />


                {loadingProgrammes ? (
                  <p style={{ marginTop: '20px' }}>
                    Loading programmes...
                  </p>
                ) : (
                  <>
                    <h3 style={{ marginTop: '25px' }}>
                      {facultyProgrammes.length} programmes found
                    </h3>


                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '20px',
                      marginTop: '20px'
                    }}>
                      {facultyProgrammes.length === 0 ? (
                        <p>No matching programmes found.</p>
                      ) : (
                        facultyProgrammes.map(programme => (
                          <div
                            key={programme.id}
                            onClick={() => setSelectedProgramme(programme)}
                            style={{
                              background: 'white',
                              padding: '22px',
                              borderRadius: '12px',
                              boxShadow: '0 3px 12px rgba(0,0,0,0.05)',
                              cursor: 'pointer'
                            }}
                          >
                            <h2>📘</h2>
                            <h3 style={{ marginTop: '10px' }}>
                              {programme.name}
                            </h3>
                            <p style={{
                              color: '#2563eb',
                              marginTop: '12px',
                              fontWeight: 'bold'
                            }}>
                              {programme.qualification_level}
                            </p>
                            <p style={{
                              color: '#64748b',
                              marginTop: '10px'
                            }}>
                              Click to view details →
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}


        {/* COURSE UNITS */}
        {activePage === 'Course Units' && (
          <div style={{
            marginTop: '25px',
            background: 'white',
            padding: '25px',
            borderRadius: '12px',
            boxShadow: '0 3px 12px rgba(0,0,0,0.05)'
          }}>
            <h2>📚 Course Unit Catalogue</h2>

            <p style={{
              color: '#64748b',
              marginTop: '8px'
            }}>
              Select a programme, year and semester to view the available units.
            </p>


            {/* PROGRAMME SELECT */}
            <label style={{
              display: 'block',
              marginTop: '25px',
              fontWeight: 'bold'
            }}>
              Programme
            </label>


            <select
              value={unitProgramme}
              onChange={e => setUnitProgramme(e.target.value)}
              style={{
                width: '100%',
                maxWidth: '600px',
                padding: '12px',
                marginTop: '8px',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '16px'
              }}
            >
              <option value="">-- Select a programme --</option>

              {sortedProgrammes.map(programme => (
                <option key={programme.id} value={programme.id}>
                  {programme.name}
                </option>
              ))}
            </select>


            {/* YEAR AND SEMESTER */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '20px',
              maxWidth: '600px',
              marginTop: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold'
                }}>
                  Year of Study
                </label>


                <select
                  value={unitYear}
                  onChange={e => setUnitYear(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>


              <div>
                <label style={{
                  display: 'block',
                  fontWeight: 'bold'
                }}>
                  Semester
                </label>


                <select
                  value={unitSemester}
                  onChange={e => setUnitSemester(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    marginTop: '8px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="1">Semester 1</option>
                  <option value="2">Semester 2</option>
                </select>
              </div>
            </div>


            {/* COURSE UNIT RESULTS */}
            <div style={{ marginTop: '30px' }}>
              {!unitProgramme ? (
                <div style={{
                  background: '#eff6ff',
                  padding: '18px',
                  borderRadius: '8px',
                  color: '#1d4ed8'
                }}>
                  Select a programme above to view its course units.
                </div>
              ) : loadingUnits ? (
                <p>Loading course units...</p>
              ) : unitError ? (
                <div style={{
                  background: '#fef2f2',
                  padding: '18px',
                  borderRadius: '8px',
                  color: '#b91c1c'
                }}>
                  Error loading course units: {unitError}
                </div>
              ) : courseUnits.length === 0 ? (
                <div style={{
                  background: '#fffbeb',
                  padding: '18px',
                  borderRadius: '8px',
                  color: '#92400e'
                }}>
                  No course units have been added for this programme,
                  year and semester yet.
                </div>
              ) : (
                <>
                  <h3>
                    {courseUnits.length} course units found
                  </h3>


                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '16px',
                    marginTop: '20px'
                  }}>
                    {courseUnits.map(unit => (
                      <div
                        key={unit.id}
                        style={{
                          background: '#f8fafc',
                          padding: '20px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <h3 style={{ color: '#2563eb' }}>
                          {unit.unit_code}
                        </h3>

                        <h4 style={{ marginTop: '8px' }}>
                          {unit.unit_title}
                        </h4>

                        {unit.description && (
                          <p style={{
                            color: '#64748b',
                            marginTop: '10px',
                            lineHeight: '1.6'
                          }}>
                            {unit.description}
                            </p>
                        )}


                        <p style={{
                          color: '#64748b',
                          marginTop: '12px',
                          fontSize: '13px'
                        }}>
                          Year {unit.year_of_study} · Semester {unit.semester}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}


        {/* STUDY NOTES */}
        {activePage === 'Study Notes' && (
          <div style={{
            marginTop: '25px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            alignItems: 'start'
          }}>
            {/* NOTES LIST */}
            <section style={{
              background: 'white',
              padding: '22px',
              borderRadius: '12px',
              boxShadow: '0 3px 12px rgba(0,0,0,0.05)'
            }}>
              <h2>📝 Notes Library</h2>
              <input
                type="text"
                placeholder="Search notes or course units..."
                value={notesSearch}
                onChange={e => setNotesSearch(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '12px',
                  marginTop: '18px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '15px'
                }}
              />

              {loadingNotes ? (
                <p style={{ marginTop: '20px' }}>Loading study notes...</p>
              ) : notesError ? (
                <p style={{ color: '#b91c1c', marginTop: '20px' }}>
                  Error loading notes: {notesError}
                </p>
              ) : filteredStudyNotes.length === 0 ? (
                <div style={{
                  marginTop: '20px',
                  padding: '15px',
                  background: '#fffbeb',
                  color: '#92400e',
                  borderRadius: '8px',
                  lineHeight: '1.5'
                }}>
                  No notes found. Notes will appear here after they are added to the database.
                </div>
              ) : (
                <div style={{ marginTop: '18px' }}>
                  {filteredStudyNotes.map(note => (
                    <button
                      key={note.id}
                      onClick={() => setSelectedNote(note)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '15px',
                        marginBottom: '10px',
                        border: selectedNote?.id === note.id
                          ? '2px solid #2563eb'
                          : '1px solid #e2e8f0',
                        borderRadius: '9px',
                        background: selectedNote?.id === note.id
                          ? '#eff6ff'
                          : '#f8fafc',
                        cursor: 'pointer'
                      }}
                    >
                      <strong>{note.title}</strong>
                      <p style={{
                        color: '#64748b',
                        marginTop: '7px',
                        fontSize: '13px'
                      }}>
                        {note.course_units?.unit_code || 'Course unit'}
                        {note.course_units?.unit_title
                          ? ` — ${note.course_units.unit_title}`
                          : ''}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>


            {/* NOTE READING AREA */}
            <section style={{
              background: 'white',
              padding: '22px',
              borderRadius: '12px',
              boxShadow: '0 3px 12px rgba(0,0,0,0.05)',
              minHeight: '300px'
            }}>
              {selectedNote ? (
                <>
                  <button
                    onClick={() => setSelectedNote(null)}
                    style={{
                      border: 'none',
                      background: '#e2e8f0',
                      padding: '8px 12px',
                      borderRadius: '7px',
                      cursor: 'pointer',
                      marginBottom: '15px'
                    }}
                  >
                    ← Back to notes list
                  </button>
                  <h2>{selectedNote.title}</h2>
                  <p style={{
                    color: '#2563eb',
                    marginTop: '8px',
                    fontWeight: 'bold'
                  }}>
                    {selectedNote.course_units?.unit_code || 'Course unit'}
                    {selectedNote.course_units?.unit_title
                      ? ` — ${selectedNote.course_units.unit_title}`
                      : ''}
                  </p>
                  <div style={{
                    marginTop: '20px',
                    color: '#334155',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'anywhere'
                  }}>
                    {selectedNote.content}
                  </div>
                </>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '45px 15px',
                  color: '#64748b'
                }}>
                  <h2>📖</h2>
                  <h3 style={{ marginTop: '12px' }}>Note Reader</h3>
                  <p style={{ marginTop: '8px' }}>
                    Select a note from the library to read it here.
                  </p>
                </div>
              )}
            </section>
          </div>
        )}


        {/* QUIZZES */}
        {activePage === 'Quizzes' && (
          <p style={{ marginTop: '25px' }}>
            Your quizzes will appear here.
          </p>
        )}


        {/* PAST PAPERS */}
        {activePage === 'Past Papers' && (
          <p style={{ marginTop: '25px' }}>
            Your past papers will appear here.
          </p>
        )}


        {/* PROFILE */}
        {activePage === 'Profile' && (
          <p style={{ marginTop: '25px' }}>
            Your student profile will appear here.
          </p>
        )}


        {/* SETTINGS */}
        {activePage === 'Settings' && (
          <p style={{ marginTop: '25px' }}>
            Your settings will appear here.
          </p>
        )}


      </main>
    </div>
  )
}


export default App
