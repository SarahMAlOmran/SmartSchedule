import { useState, useEffect } from 'react';
import './App.css';

interface Section {
  name: string;
  schedule: {
    [day: string]: string[];
  };
}

interface ScheduleData {
  [level: number]: {
    sections: Section[];
  };
}

interface IrregularStudent {
  _id: string;
  student_id: string;
  user_id: string;
  level: number;
  irregulars: boolean;
  prevent_falling_behind_courses: string[];
  remaining_courses_from_past_levels: string[];
  courses_taken: string[];
  user_elective_choice: string[];
}

interface Course {
  _id: string;
  name: string;
  code: string;
  credit_hours: number;
  department: string;
}

function SchedulingCommittee() {
  const [currentLevel, setCurrentLevel] = useState(3);
  const [selectedGenerationLevel, setSelectedGenerationLevel] = useState<number | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [irregularStudents, setIrregularStudents] = useState<IrregularStudent[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state for adding new irregular student
  const [newIrregular, setNewIrregular] = useState({
    student_id: '',
    user_id: '',
    level: 3,
    prevent_falling_behind_courses: [] as string[],
    remaining_courses_from_past_levels: [] as string[],
    courses_taken: [] as string[],
    user_elective_choice: [] as string[]
  });

  const scheduleData: ScheduleData = {
    3: {
      sections: [
        {
          name: "Section 1",
          schedule: {
            "Sunday": ["PHYS 103", "PHYS 103", "MATH 106", "MATH 106", "BREAK", "BREAK", "MATH 151"],
            "Monday": ["PHYS 103 Lab", "PHYS 103 Lab", "MATH 106 Tut", "MATH 106 Tut", "BREAK", "BREAK", "IC 105"],
            "Tuesday": ["PHYS 103", "PHYS 103", "MATH 106", "MATH 106", "BREAK", "BREAK", "MATH 151"],
            "Wednesday": ["IC 105", "IC 105", "MATH 151 Tut", "MATH 151 Tut", "BREAK", "BREAK", "CSC 111 Lab"],
            "Thursday": ["PHYS 103", "PHYS 103", "MATH 106", "MATH 106", "BREAK", "BREAK", "MATH 151"]
          }
        }
      ]
    }
  };

  useEffect(() => {
    fetchIrregularStudents();
    fetchCourses();
  }, []);

  const fetchIrregularStudents = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/irregular-students');
      if (response.ok) {
        const data = await response.json();
        setIrregularStudents(data);
      } else {
        console.error('Failed to fetch irregular students');
        setIrregularStudents([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching irregular students:', error);
      setIrregularStudents([]); // Set empty array on error
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses');
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        console.error('Failed to fetch courses');
        setCourses([]); // Set empty array on error
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]); // Set empty array on error
    }
  };

  const handleAddIrregular = async () => {
    if (!newIrregular.student_id || !newIrregular.user_id) {
      alert('Please fill in Student ID and User ID');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/irregular-students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIrregular)
      });

      if (response.ok) {
        alert('Irregular student added successfully!');
        setShowAddForm(false);
        setNewIrregular({
          student_id: '',
          user_id: '',
          level: 3,
          prevent_falling_behind_courses: [],
          remaining_courses_from_past_levels: [],
          courses_taken: [],
          user_elective_choice: []
        });
        fetchIrregularStudents();
      } else {
        alert('Failed to add irregular student');
      }
    } catch (error) {
      console.error('Error adding irregular student:', error);
      alert('Error adding irregular student');
    }
  };

  const handleDeleteIrregular = async (id: string) => {
    if (!confirm('Are you sure you want to delete this irregular student?')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/irregular-students/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('Irregular student deleted successfully!');
        fetchIrregularStudents();
      } else {
        alert('Failed to delete irregular student');
      }
    } catch (error) {
      console.error('Error deleting irregular student:', error);
      alert('Error deleting irregular student');
    }
  };

  const toggleCourseSelection = (courseCode: string, field: 'prevent_falling_behind_courses' | 'remaining_courses_from_past_levels' | 'courses_taken') => {
    setNewIrregular(prev => {
      const courses = prev[field];
      if (courses.includes(courseCode)) {
        return { ...prev, [field]: courses.filter(c => c !== courseCode) };
      } else {
        return { ...prev, [field]: [...courses, courseCode] };
      }
    });
  };

  const handleLevelChange = (level: number) => {
    setCurrentLevel(level);
  };

  const handleGenerateLevel = (level: number) => {
    setSelectedGenerationLevel(level);
  };

  const confirmGeneration = async () => {
    if (!selectedGenerationLevel) {
      alert('Please select an academic level first');
      return;
    }

    try {
      const inputData = {
        days: 5,
        slots_per_day: 8,
        subjects: [
          { name: "Math 106", duration: 5 },
          { name: "Phy 103", duration: 5 },
          { name: "Math 151", duration: 5 },
          { name: "CSC 111", duration: 5 },
          { name: "MBI 140", duration: 4 },
          { name: "IC 106", duration: 2 }
        ],
        level: selectedGenerationLevel
      };

      alert(`🔄 Generating schedule for Level ${selectedGenerationLevel}...\n\nCalling backend API...`);

      const response = await fetch('http://localhost:5000/generate-schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inputData)
      });

      if (!response.ok) throw new Error('Failed to generate schedule');

      const data = await response.json();
      console.log('✅ Backend Response:', data);

      if (data.success && data.schedule) {
        alert(`✅ Schedule generated successfully for Level ${selectedGenerationLevel}!`);
      } else {
        alert('❌ Backend error: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ Frontend Error:', error);
      alert('Error generating schedule. Backend may not be running.');
    }
  };

  const publishSchedule = () => {
    alert('Schedule published successfully! Students can now view the updated schedule.');
  };

  const enableEditing = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      alert('Editing mode enabled. Click on any course cell to edit.');
    } else {
      alert('Changes saved successfully!');
    }
  };

  const renderSchedule = () => {
    const levelData = scheduleData[currentLevel];
    if (!levelData) return null;

    return levelData.sections.map((section, sectionIndex) => (
      <tbody key={sectionIndex}>
        <tr className="table-secondary">
          <td colSpan={8} className="fw-bold">{section.name}</td>
        </tr>
        {Object.keys(section.schedule).map((day) => (
          <tr key={day}>
            <td className="fw-bold">{day}</td>
            {section.schedule[day].map((course, courseIndex) => {
              if (course === 'BREAK') {
                return <td key={courseIndex} className="break-cell">{course}</td>;
              } else {
                return (
                  <td 
                    key={courseIndex} 
                    className={isEditing ? 'editable-cell' : ''}
                    contentEditable={isEditing}
                    suppressContentEditableWarning={true}
                    style={isEditing ? { backgroundColor: '#e3f2fd' } : {}}
                  >
                    {course}
                  </td>
                );
              }
            })}
          </tr>
        ))}
      </tbody>
    ));
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container-fluid">
          <a className="navbar-brand fw-bold" href="#">
            <i className="bi bi-calendar-check me-2"></i>SmartSchedule
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link active" href="#"><i className="bi bi-house-door"></i> Dashboard</a>
              </li>
            </ul>
            <ul className="navbar-nav">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  <i className="bi bi-person-circle"></i> Committee Member
                </a>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li><a className="dropdown-item" href="#">Profile</a></li>
                  <li><a className="dropdown-item" href="#">Settings</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="/">Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container my-4">
        <div className="row mb-4">
          <div className="col-12">
            <div className="dashboard-card bg-primary text-white">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <h3 className="fw-bold mb-2">Scheduling Committee Dashboard</h3>
                  <p className="mb-0">Manage academic schedules, rules, and student feedback</p>
                </div>
                <div className="col-md-4 text-end">
                  <div className="bg-light bg-opacity-25 p-3 rounded">
                    <h5 className="mb-1">Current Timeline</h5>
                    <p className="mb-0 fw-bold">Fall 2025 - Final Version</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row mb-4">
          <div className="col-md-3">
            <div className="dashboard-card text-center">
              <i className="bi bi-people fs-1 text-primary mb-3"></i>
              <h5>Student Sections</h5>
              <p>Configure section sizes and settings</p>
              <button className="btn btn-outline-primary btn-sm">
                Manage Sections
              </button>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card text-center">
              <i className="bi bi-person-exclamation fs-1 text-danger mb-3"></i>
              <h5>Irregular Students</h5>
              <p>Manage students with special schedules</p>
              <button className="btn btn-outline-danger btn-sm" data-bs-toggle="modal" data-bs-target="#irregularStudentsModal">
                Manage Students
              </button>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card text-center">
              <i className="bi bi-calendar-plus fs-1 text-warning mb-3"></i>
              <h5>Generate Schedule</h5>
              <p>Create new schedule based on current data</p>
              <button className="btn btn-outline-warning btn-sm" data-bs-toggle="modal" data-bs-target="#generateScheduleModal">
                Generate Now
              </button>
            </div>
          </div>
          <div className="col-md-3">
            <div className="dashboard-card text-center">
              <i className="bi bi-chat-dots fs-1 text-info mb-3"></i>
              <h5>Student Comments</h5>
              <p>Review and manage student feedback</p>
              <button className="btn btn-outline-info btn-sm">
                View All Comments
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <h5 className="fw-bold mb-3">Academic Levels</h5>
          <div className="btn-group" role="group">
            {[3, 4, 5, 6, 7, 8].map(level => (
              <button
                key={level}
                className={`btn ${currentLevel === level ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => handleLevelChange(level)}
              >
                Level {level}
              </button>
            ))}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Academic Schedule - Level {currentLevel}</h5>
            <div>
              <button className={`btn btn-sm me-2 ${isEditing ? 'btn-primary' : 'btn-outline-primary'}`} onClick={enableEditing}>
                <i className={`bi ${isEditing ? 'bi-check' : 'bi-pencil'}`}></i> {isEditing ? 'Save Changes' : 'Edit Schedule'}
              </button>
              <button className="btn btn-success btn-sm me-2" onClick={publishSchedule}>
                <i className="bi bi-send-check"></i> Publish Schedule
              </button>
              <button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#generateScheduleModal">
                <i className="bi bi-magic"></i> ReGenerate Schedule
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered schedule-table">
              <thead>
                <tr>
                  <th>Section/Day</th>
                  <th>8:00-8:50</th>
                  <th>9:00-9:50</th>
                  <th>10:00-10:50</th>
                  <th>11:00-11:50</th>
                  <th>12:00-12:50</th>
                  <th>1:00-1:50</th>
                  <th>2:00-2:50</th>
                </tr>
              </thead>
              {renderSchedule()}
            </table>
          </div>
        </div>
      </div>

      {/* Generate Schedule Modal */}
      <div className="modal fade" id="generateScheduleModal" tabIndex={-1}>
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Generate New Schedule</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label fw-bold">Select Academic Level</label>
                <div className="btn-group-vertical w-100" role="group">
                  {[3, 4, 5, 6, 7, 8].map(level => (
                    <button
                      key={level}
                      type="button"
                      className={`btn text-start generate-option-btn ${selectedGenerationLevel === level ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => handleGenerateLevel(level)}
                    >
                      <i className={`bi bi-${level}-circle me-2`}></i> Level {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" className="btn btn-primary" onClick={confirmGeneration} data-bs-dismiss="modal">
                Generate Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Irregular Students Modal */}
      <div className="modal fade" id="irregularStudentsModal" tabIndex={-1}>
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Manage Irregular Students</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6>Total Irregular Students: <span className="badge bg-danger">{irregularStudents.length}</span></h6>
                <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
                  <i className="bi bi-plus-circle me-2"></i>
                  {showAddForm ? 'Cancel' : 'Add Irregular Student'}
                </button>
              </div>

              {showAddForm && (
                <div className="card mb-3">
                  <div className="card-body">
                    <h6 className="card-title">Add New Irregular Student</h6>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Student ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g., 443200002"
                          value={newIrregular.student_id}
                          onChange={(e) => setNewIrregular({...newIrregular, student_id: e.target.value})}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">User ID *</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g., user_12345"
                          value={newIrregular.user_id}
                          onChange={(e) => setNewIrregular({...newIrregular, user_id: e.target.value})}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Level *</label>
                        <select
                          className="form-select"
                          value={newIrregular.level}
                          onChange={(e) => setNewIrregular({...newIrregular, level: parseInt(e.target.value)})}
                        >
                          {[3, 4, 5, 6, 7, 8].map(level => (
                            <option key={level} value={level}>Level {level}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Prevent Falling Behind Courses</label>
                      <div className="border rounded p-2" style={{maxHeight: '150px', overflowY: 'auto'}}>
                        {courses.map(course => (
                          <div key={course._id} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={newIrregular.prevent_falling_behind_courses.includes(course.code)}
                              onChange={() => toggleCourseSelection(course.code, 'prevent_falling_behind_courses')}
                              id={`prevent-${course.code}`}
                            />
                            <label className="form-check-label" htmlFor={`prevent-${course.code}`}>
                              {course.code} - {course.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <small className="text-muted">Selected: {newIrregular.prevent_falling_behind_courses.join(', ') || 'None'}</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Remaining Courses from Past Levels</label>
                      <div className="border rounded p-2" style={{maxHeight: '150px', overflowY: 'auto'}}>
                        {courses.map(course => (
                          <div key={course._id} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={newIrregular.remaining_courses_from_past_levels.includes(course.code)}
                              onChange={() => toggleCourseSelection(course.code, 'remaining_courses_from_past_levels')}
                              id={`remaining-${course.code}`}
                            />
                            <label className="form-check-label" htmlFor={`remaining-${course.code}`}>
                              {course.code} - {course.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <small className="text-muted">Selected: {newIrregular.remaining_courses_from_past_levels.join(', ') || 'None'}</small>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Courses Taken</label>
                      <div className="border rounded p-2" style={{maxHeight: '150px', overflowY: 'auto'}}>
                        {courses.map(course => (
                          <div key={course._id} className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={newIrregular.courses_taken.includes(course.code)}
                              onChange={() => toggleCourseSelection(course.code, 'courses_taken')}
                              id={`taken-${course.code}`}
                            />
                            <label className="form-check-label" htmlFor={`taken-${course.code}`}>
                              {course.code} - {course.name}
                            </label>
                          </div>
                        ))}
                      </div>
                      <small className="text-muted">Selected: {newIrregular.courses_taken.join(', ') || 'None'}</small>
                    </div>

                    <button className="btn btn-success" onClick={handleAddIrregular}>
                      <i className="bi bi-check-circle me-2"></i>Save Irregular Student
                    </button>
                  </div>
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="table-light">
                    <tr>
                      <th>Student ID</th>
                      <th>Level</th>
                      <th>Prevent Falling Behind</th>
                      <th>Remaining Courses</th>
                      <th>Courses Taken</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {irregularStudents.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted">No irregular students found</td>
                      </tr>
                    ) : (
                      irregularStudents.map(student => (
                        <tr key={student._id}>
                          <td className="fw-bold">{student.student_id}</td>
                          <td><span className="badge bg-primary">Level {student.level}</span></td>
                          <td>
                            <small>{student.prevent_falling_behind_courses.join(', ') || 'None'}</small>
                          </td>
                          <td>
                            <small>{student.remaining_courses_from_past_levels.join(', ') || 'None'}</small>
                          </td>
                          <td>
                            <small className="text-muted">{student.courses_taken.length} courses</small>
                          </td>
                          <td>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleDeleteIrregular(student._id)}
                            >
                              <i className="bi bi-trash"></i> Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SchedulingCommittee;