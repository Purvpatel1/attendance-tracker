// =========================================================================
// OFFICIAL T.Y.B.TECH SEMESTER V (AY 2026-27) TIMETABLE & CURRICULUM PRESETS
// =========================================================================

export const PROGRAM_PROGRAMS = {
  CE: 'Computer Engineering (CE)',
  CSE: 'Computer Science & Engineering (CSE)',
  AIML: 'Computer Science Engineering-AIML (AIML)',
  IT: 'Information Technology (IT)',
};

export const BRANCH_BATCH_MAP = {
  'Computer Engineering (CE)': ['CE1', 'CE2'],
  'Computer Science & Engineering (CSE)': ['CSE1', 'CSE2'],
  'Computer Science Engineering-AIML (AIML)': ['AM1', 'AM2'],
  'Information Technology (IT)': ['IT1', 'IT2'],
};

// -------------------------------------------------------------------------
// 1. SUBJECTS DEFINITION (BY BRANCH)
// -------------------------------------------------------------------------
export const SUBJECTS_BY_BRANCH = {
  'Computer Engineering (CE)': [
    { code: '26AF1245PC501', shortName: 'ML', name: 'Machine Learning', type: 'Lecture', teacher: 'Prof. Sureshsingh Rajpurohit', credits: '3+0' },
    { code: '26AF1245PCL508', shortName: 'ML Lab', name: 'Machine Learning Laboratory', type: 'Lab', teacher: 'Prof. Sureshsingh Rajpurohit', credits: '0+4' },
    { code: '26AF1245PC502', shortName: 'TOC', name: 'Theory of Computations', type: 'Lecture', teacher: 'Prof. Shridhar Iyer', credits: '3+0' },
    { code: '26AF1245PC503', shortName: 'OS', name: 'Operating System', type: 'Lecture', teacher: 'Prof. Swapna Ambekar', credits: '3+0' },
    { code: '26AF1245PCL509', shortName: 'OSL', name: 'Operating System Laboratory', type: 'Lab', teacher: 'Prof. Swapna Ambekar', credits: '0+4' },
    { code: '26AF1245PC504', shortName: 'DBMS', name: 'Database Management System', type: 'Lecture', teacher: 'Prof. Apurva Joshi', credits: '3+0' },
    { code: '26AF1245PCL510', shortName: 'DBMSL', name: 'Database Management System Laboratory', type: 'Lab', teacher: 'Prof. Apurva Joshi', credits: '0+4' },
    { code: '26AF1245PE505', shortName: 'ESDMS', name: 'Entrepreneurship Skills and Digital Marketing Strategies', type: 'Lecture', teacher: 'Prof. Anju Tailor', credits: '4+0' },
    { code: '26AF1245MD506', shortName: 'QUANTUM', name: 'Foundation of Quantum Computing', type: 'Lecture', teacher: 'Prof. Pramod Bide', credits: '3+0' },
    { code: '26AF1000OE507', shortName: 'CG', name: 'Computer Graphics', type: 'Lecture', teacher: 'Prof. Shahista Agwan', credits: '3+0' },
    { code: '25AF1245SEM511', shortName: 'SEMINAR', name: 'Seminar & Mini Project', type: 'Seminar', teacher: 'Prof. Apurva Joshi / Prof. Sureshsingh Rajpurohit', credits: '0+4' },
  ],

  'Computer Science & Engineering (CSE)': [
    { code: '26AF1245PC501', shortName: 'ML', name: 'Machine Learning', type: 'Lecture', teacher: 'Prof. Sureshsingh Rajpurohit', credits: '3+0' },
    { code: '26AF1245PCL508', shortName: 'ML Lab', name: 'Machine Learning Laboratory', type: 'Lab', teacher: 'Prof. Sureshsingh Rajpurohit', credits: '0+4' },
    { code: '26AF1245PC502', shortName: 'TOC', name: 'Theory of Computations', type: 'Lecture', teacher: 'Prof. Shridhar Iyer', credits: '3+0' },
    { code: '26AF1245PC503', shortName: 'OS', name: 'Operating System', type: 'Lecture', teacher: 'Prof. Swapna Ambekar', credits: '3+0' },
    { code: '26AF1245PCL509', shortName: 'OSL', name: 'Operating System Laboratory', type: 'Lab', teacher: 'Prof. Swapna Ambekar', credits: '0+4' },
    { code: '26AF1245PC504', shortName: 'DBMS', name: 'Database Management System', type: 'Lecture', teacher: 'Prof. Apurva Joshi', credits: '3+0' },
    { code: '26AF1245PCL510', shortName: 'DBMSL', name: 'Database Management System Laboratory', type: 'Lab', teacher: 'Prof. Apurva Joshi', credits: '0+4' },
    { code: '26AF1245PE505', shortName: 'ESDMS', name: 'Entrepreneurship Skills and Digital Marketing Strategies', type: 'Lecture', teacher: 'Prof. Anju Tailor', credits: '4+0' },
    { code: '26AF1245MD506', shortName: 'QUANTUM', name: 'Foundation of Quantum Computing', type: 'Lecture', teacher: 'Prof. Pramod Bide', credits: '3+0' },
    { code: '26AF1000OE507', shortName: 'CG', name: 'Computer Graphics', type: 'Lecture', teacher: 'Prof. Shahista Agwan', credits: '3+0' },
    { code: '25AF1245SEM511', shortName: 'SEMINAR', name: 'Seminar & Mini Project', type: 'Seminar', teacher: 'Prof. Aditi Malkar', credits: '0+4' },
  ],

  'Computer Science Engineering-AIML (AIML)': [
    { code: '26AF1245PC501', shortName: 'ML', name: 'Machine Learning', type: 'Lecture', teacher: 'Prof. Shruti Mathur', credits: '3+0' },
    { code: '26AF1245PCL508', shortName: 'ML Lab', name: 'Machine Learning Laboratory', type: 'Lab', teacher: 'Mr. Wellborn Bar', credits: '0+4' },
    { code: '26AFAIPC502', shortName: 'PIJ', name: 'Object Oriented Programming in Java', type: 'Lecture', teacher: 'Prof. Jarna Nagpal', credits: '3+0' },
    { code: '26AFAIPC503', shortName: 'CDAIS', name: 'Cloud and Distributed AI Systems', type: 'Lecture', teacher: 'Prof. Avina Devadiga', credits: '3+0' },
    { code: '26AFAIPC504', shortName: 'DEBDS', name: 'Data Engineering and Big Data Systems', type: 'Lecture', teacher: 'Prof. Prashant Islur', credits: '3+0' },
    { code: '26AF1XXXOEM505X', shortName: 'ESDMS', name: 'Entrepreneurship Skills and Digital Marketing Strategies', type: 'Lecture', teacher: 'Prof. Jugnu Manhas', credits: '4+0' },
    { code: '25AF1245MD506B', shortName: 'DBMS', name: 'Database Management System', type: 'Lecture', teacher: 'Prof. Aditi Malkar', credits: '3+0' },
    { code: '25AF1245MDL506B', shortName: 'DBMSL', name: 'Database Management Systems Laboratory', type: 'Lab', teacher: 'Prof. Aditi Malkar', credits: '0+4' },
    { code: '26AFAIPE507C', shortName: 'AICS', name: 'AI for Cybersecurity', type: 'Lecture', teacher: 'Prof. Shahista Agwan', credits: '3+0' },
    { code: '26AFAIPCL509', shortName: 'MLOps', name: 'MLOps Laboratory', type: 'Lab', teacher: 'Prof. Raj Gohil', credits: '1+4' },
    { code: '25AFAISEM511', shortName: 'SEMINAR', name: 'Seminar and Mini Project', type: 'Seminar', teacher: 'Prof. Swapna Ambekar', credits: '0+4' },
  ],

  'Information Technology (IT)': [
    { code: '26AF1246PC501', shortName: 'OS', name: 'Operating System', type: 'Lecture', teacher: 'Prof. Chinmay Raut', credits: '3+0' },
    { code: '26AF1246PCL502', shortName: 'OSL', name: 'Operating System Laboratory', type: 'Lab', teacher: 'Prof. Farhan Shaikh', credits: '0+4' },
    { code: '26AF1246PC503', shortName: 'DBMS', name: 'Database Management Systems', type: 'Lecture', teacher: 'Prof. Aditi Malkar', credits: '3+0' },
    { code: '26AF1246PCL504', shortName: 'DBMSL', name: 'Database Management Systems Lab', type: 'Lab', teacher: 'Prof. Aditi Malkar', credits: '0+4' },
    { code: '26AF1246PC505', shortName: 'CD', name: 'Compiler Design', type: 'Lecture', teacher: 'Dr. Amol Joglekar', credits: '3+0' },
    { code: '26AFAIMD506A', shortName: 'MINOR ML', name: 'Minor Machine Learning', type: 'Lecture', teacher: 'Prof. Nilesh Patil', credits: '3+0' },
    { code: '26AFAIMD506LA', shortName: 'ML LAB', name: 'Minor Machine Learning Lab', type: 'Lab', teacher: 'Mr. Welborn Bar', credits: '0+4' },
    { code: '25AF1MACOEMO5(X)', shortName: 'ESDMS', name: 'Entrepreneurship Skills and Digital Marketing Strategies', type: 'Lecture', teacher: 'Prof. Jignu Manhas', credits: '4+0' },
    { code: '26AF1246PE508A', shortName: 'DSV', name: 'Data Science and Visualization', type: 'Lecture', teacher: 'Prof. Sneha Valia', credits: '3+0' },
    { code: '26AF1246PEL509A', shortName: 'DSVL', name: 'Data Science and Visualization with Python Lab', type: 'Lab', teacher: 'Prof. Sneha Valia', credits: '0+4' },
    { code: '26AF1246ELC510', shortName: 'MINI PROJECT', name: 'Mini Project', type: 'Project', teacher: 'Prof. Sureshsingh Rajpurohit', credits: '0+4' },
  ],
};

// -------------------------------------------------------------------------
// 2. TIMETABLE SLOTS DATA (BY BRANCH)
// batchScope: "ALL" for branch lectures, or specific batch string (e.g. "CE1", "CE2")
// -------------------------------------------------------------------------
export const TIMETABLE_SLOTS_BY_BRANCH = {
  // ==========================================
  // COMPUTER ENGINEERING (CE)
  // ==========================================
  'Computer Engineering (CE)': [
    // Monday
    { dayOfWeek: 1, startTime: '08:00', endTime: '09:00', code: '26AF1000OE507', room: 'UB', batchScope: 'ALL' },
    { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', code: '26AF1000OE507', room: 'UB', batchScope: 'ALL' },
    { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', code: '26AF1245PC503', room: 'UB', batchScope: 'ALL' },
    { dayOfWeek: 1, startTime: '11:00', endTime: '12:00', code: '26AF1245PC501', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 1, startTime: '13:00', endTime: '14:00', code: '26AF1245PC503', room: 'CC1', batchScope: 'ALL' },

    // Tuesday
    { dayOfWeek: 2, startTime: '08:00', endTime: '09:00', code: '26AF1245MD506', room: 'CR202', batchScope: 'ALL' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '10:00', code: '26AF1245MD506', room: 'CR202', batchScope: 'ALL' },
    { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', code: '26AF1245PC504', room: 'CR202', batchScope: 'ALL' },
    { dayOfWeek: 2, startTime: '11:00', endTime: '12:00', code: '26AF1245PC502', room: 'CR202', batchScope: 'ALL' },
    { dayOfWeek: 2, startTime: '14:00', endTime: '16:00', code: '26AF1245PCL508', room: 'ROBOTICS LAB 6TH FLOOR', batchScope: 'CE1' },

    // Wednesday
    { dayOfWeek: 3, startTime: '08:00', endTime: '09:00', code: '26AF1245PE505', room: 'UB', batchScope: 'ALL' },
    { dayOfWeek: 3, startTime: '09:00', endTime: '10:00', code: '26AF1245PC501', room: 'UB', batchScope: 'ALL' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '11:00', code: '26AF1245PC504', room: 'UB', batchScope: 'ALL' },
    { dayOfWeek: 3, startTime: '12:00', endTime: '14:00', code: '26AF1245PCL510', room: 'DBMSL CC1', batchScope: 'CE1' },
    { dayOfWeek: 3, startTime: '12:00', endTime: '14:00', code: '26AF1245PCL508', room: 'CC1', batchScope: 'CE2' },
    { dayOfWeek: 3, startTime: '14:00', endTime: '16:00', code: '26AF1245PCL509', room: 'CC1', batchScope: 'CE2' },

    // Thursday
    { dayOfWeek: 4, startTime: '08:00', endTime: '09:00', code: '26AF1245PC503', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '10:00', code: '26AF1245MD506', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '10:00', endTime: '11:00', code: '26AF1000OE507', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '11:00', endTime: '12:00', code: '26AF1245PC504', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '12:00', endTime: '14:00', code: '26AF1245PCL509', room: 'CC1', batchScope: 'CE1' },
    { dayOfWeek: 4, startTime: '13:00', endTime: '14:00', code: '26AF1245PC501', room: 'CR2', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '14:00', endTime: '17:00', code: '26AF1245PE505', room: 'CC1', batchScope: 'ALL' },

    // Friday
    { dayOfWeek: 5, startTime: '12:00', endTime: '14:00', code: '26AF1245PCL510', room: 'DBMSL CC1', batchScope: 'CE2' },
    { dayOfWeek: 5, startTime: '12:00', endTime: '14:00', code: '26AF1245PCL509', room: 'OSL CC1', batchScope: 'CE1' },
    { dayOfWeek: 5, startTime: '14:00', endTime: '16:00', code: '26AF1245PC502', room: 'CR1', batchScope: 'ALL' },

    // Saturday
    { dayOfWeek: 6, startTime: '10:00', endTime: '12:00', code: '25AF1245SEM511', room: 'SEMINAR CC1', batchScope: 'CE1' },
    { dayOfWeek: 6, startTime: '10:00', endTime: '12:00', code: '25AF1245SEM511', room: 'SEMINAR CC1', batchScope: 'CE2' },
    { dayOfWeek: 6, startTime: '12:00', endTime: '14:00', code: '25AF1245SEM511', room: 'SEMINAR CC1', batchScope: 'CE1' },
    { dayOfWeek: 6, startTime: '12:00', endTime: '14:00', code: '25AF1245SEM511', room: 'SEMINAR CC1', batchScope: 'CE2' },
  ],

  // ==========================================
  // COMPUTER SCIENCE & ENGINEERING (CSE)
  // ==========================================
  'Computer Science & Engineering (CSE)': [
    // Monday
    { dayOfWeek: 1, startTime: '08:00', endTime: '10:00', code: '26AF1245MD506', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', code: '26AF1245PC501', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 1, startTime: '12:00', endTime: '14:00', code: '26AF1245PCL508', room: 'LAB-IV 5TH FLOOR SBMP', batchScope: 'CSE2' },
    { dayOfWeek: 1, startTime: '12:00', endTime: '14:00', code: '26AF1245PCL509', room: 'HW LAB 3RD FLOOR SBMP', batchScope: 'CSE1' },
    { dayOfWeek: 1, startTime: '14:00', endTime: '16:00', code: '26AF1245PC502', room: 'CR2', batchScope: 'ALL' },

    // Tuesday
    { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', code: '26AF1245PC503', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 2, startTime: '11:00', endTime: '13:00', code: '26AF1245PCL508', room: 'CC1', batchScope: 'CSE1' },
    { dayOfWeek: 2, startTime: '14:00', endTime: '16:00', code: '26AF1000OE507', room: 'CR2', batchScope: 'ALL' },

    // Wednesday
    { dayOfWeek: 3, startTime: '08:00', endTime: '10:00', code: '26AF1245PCL510', room: 'CC1', batchScope: 'CSE1' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '10:00', code: '26AF1245PCL509', room: 'CC1', batchScope: 'CSE2' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '12:00', code: '26AF1245PC504', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 3, startTime: '11:00', endTime: '13:00', code: '26AF1245PCL510', room: 'CC1', batchScope: 'CSE2' },
    { dayOfWeek: 3, startTime: '14:00', endTime: '16:00', code: '26AF1245PE505', room: 'CR-24B SBMP', batchScope: 'ALL' },

    // Thursday
    { dayOfWeek: 4, startTime: '08:00', endTime: '09:00', code: '26AF1245MD506', room: 'CR202', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '09:00', endTime: '10:00', code: '26AF1245PC503', room: 'CR202', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '10:00', endTime: '11:00', code: '26AF1245PC501', room: 'CR202', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '11:00', endTime: '12:00', code: '26AF1000OE507', room: 'CR202', batchScope: 'ALL' },

    // Friday
    { dayOfWeek: 5, startTime: '10:00', endTime: '11:00', code: '26AF1245PC502', room: 'UB', batchScope: 'ALL' },
    { dayOfWeek: 5, startTime: '11:00', endTime: '12:00', code: '26AF1245PC503', room: 'CC1', batchScope: 'ALL' },
    { dayOfWeek: 5, startTime: '13:00', endTime: '14:00', code: '26AF1245PC501', room: 'CR2', batchScope: 'ALL' },
    { dayOfWeek: 5, startTime: '14:00', endTime: '15:00', code: '26AF1245PC504', room: 'CR2', batchScope: 'ALL' },
    { dayOfWeek: 5, startTime: '15:00', endTime: '17:00', code: '26AF1245PE505', room: 'CR2', batchScope: 'ALL' },

    // Saturday
    { dayOfWeek: 6, startTime: '08:00', endTime: '12:00', code: '25AF1245SEM511', room: 'SEMINAR CC1', batchScope: 'ALL' },
  ],

  // ==========================================
  // COMPUTER SCIENCE ENGINEERING-AIML (AIML)
  // ==========================================
  'Computer Science Engineering-AIML (AIML)': [
    // Monday
    { dayOfWeek: 1, startTime: '08:00', endTime: '10:00', code: '25AF1245MDL506B', room: 'DBMSL CC1', batchScope: 'AM1' },
    { dayOfWeek: 1, startTime: '08:00', endTime: '10:00', code: '26AFAIPCL509', room: 'MLOps CC1', batchScope: 'AM2' },
    { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', code: '26AF1245PC501', room: '24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 1, startTime: '12:00', endTime: '14:00', code: '26AFAIPE507C', room: '24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 1, startTime: '14:00', endTime: '15:00', code: '26AFAIPC503', room: 'CR-24B 6TH FLOOR SBM', batchScope: 'ALL' },

    // Tuesday
    { dayOfWeek: 2, startTime: '08:00', endTime: '10:00', code: '25AF1245MD506B', room: '24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', code: '26AF1245PC501', room: '24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 2, startTime: '11:00', endTime: '12:00', code: '26AFAIPC502', room: 'CR-24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 2, startTime: '12:00', endTime: '14:00', code: '26AF1245PCL508', room: 'LAB-V 5TH FLOOR SBMP', batchScope: 'AM1' },
    { dayOfWeek: 2, startTime: '12:00', endTime: '14:00', code: '25AF1245MDL506B', room: 'LAB-VI 5TH FLOOR SBMP', batchScope: 'AM2' },

    // Wednesday
    { dayOfWeek: 3, startTime: '07:30', endTime: '09:30', code: '26AFAIPCL509', room: 'LAB 3RD FLOOR ENV LAB', batchScope: 'AM1' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '12:00', code: '26AFAIPC503', room: 'CR 24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 3, startTime: '13:00', endTime: '15:00', code: '26AFAIPC504', room: '24B SBMP', batchScope: 'ALL' },

    // Thursday
    { dayOfWeek: 4, startTime: '08:00', endTime: '10:00', code: '26AF1XXXOEM505X', room: '24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '10:00', endTime: '12:00', code: '26AFAIPC502', room: 'CR-24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '13:00', endTime: '14:00', code: '25AF1245MD506B', room: '24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '14:00', endTime: '15:00', code: '26AFAIPE507C', room: '24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '15:00', endTime: '16:00', code: '26AFAIPC504', room: '24B SBMP', batchScope: 'ALL' },

    // Friday
    { dayOfWeek: 5, startTime: '08:00', endTime: '10:00', code: '26AF1XXXOEM505X', room: 'CR-24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 5, startTime: '10:00', endTime: '11:00', code: '26AF1245PC501', room: '24B SBMP', batchScope: 'ALL' },
    { dayOfWeek: 5, startTime: '12:00', endTime: '14:00', code: '26AF1245PCL508', room: 'LAB-VI 5TH FLR SBMP', batchScope: 'AM2' },

    // Saturday
    { dayOfWeek: 6, startTime: '08:00', endTime: '10:00', code: '26AFAIPCL509', room: '24B 6TH FLOOR SBMP', batchScope: 'ALL' },
    { dayOfWeek: 6, startTime: '10:00', endTime: '14:00', code: '25AFAISEM511', room: 'SEMINAR CC1', batchScope: 'ALL' },
  ],

  // ==========================================
  // INFORMATION TECHNOLOGY (IT)
  // ==========================================
  'Information Technology (IT)': [
    // Monday
    { dayOfWeek: 1, startTime: '13:00', endTime: '14:00', code: '26AFAIMD506A', room: 'CR2', batchScope: 'ALL' },
    { dayOfWeek: 1, startTime: '15:00', endTime: '17:00', code: '26AF1246PC505', room: 'CR1', batchScope: 'ALL' },

    // Tuesday
    { dayOfWeek: 2, startTime: '08:00', endTime: '09:00', code: '26AFAIMD506LA', room: 'HW LAB 3RD FLOOR', batchScope: 'IT2' },
    { dayOfWeek: 2, startTime: '09:00', endTime: '10:00', code: '26AF1246PCL502', room: 'MINOR ENV LAB 3RD FLOOR', batchScope: 'IT1' },
    { dayOfWeek: 2, startTime: '10:00', endTime: '12:00', code: '25AF1MACOEMO5(X)', room: 'UB', batchScope: 'ALL' },

    // Wednesday
    { dayOfWeek: 3, startTime: '08:00', endTime: '10:00', code: '26AF1246PEL509A', room: 'HARDWARE LAB 3RD FLOOR', batchScope: 'IT1' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '10:00', code: '26AF1246PCL502', room: 'LAB1 5TH FLOOR SBMP', batchScope: 'IT2' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '12:00', code: '26AF1246PEL509A', room: 'HARDWARE LAB 3RD FLOOR', batchScope: 'IT2' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '12:00', code: '26AFAIMD506LA', room: 'AR/VR 7TH FLOOR MPSTME', batchScope: 'IT1' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '12:00', code: '26AF1246PE508A', room: 'CR2', batchScope: 'ALL' },
    { dayOfWeek: 3, startTime: '12:00', endTime: '13:00', code: '26AF1246PE508A', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 3, startTime: '13:00', endTime: '15:00', code: '26AFAIMD506A', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 3, startTime: '15:00', endTime: '16:00', code: '26AF1246PC503', room: 'CC1', batchScope: 'ALL' },

    // Thursday
    { dayOfWeek: 4, startTime: '08:00', endTime: '10:00', code: '26AF1246PCL504', room: 'HW Lab 3rd FLOOR SBMP', batchScope: 'IT2' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '10:00', code: '26AF1246PC501', room: 'CR OS CR1', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '10:00', endTime: '12:00', code: '25AF1MACOEMO5(X)', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '13:00', endTime: '14:00', code: '26AF1246PC501', room: 'CR OS CR1', batchScope: 'ALL' },
    { dayOfWeek: 4, startTime: '15:00', endTime: '17:00', code: '26AF1246PC503', room: 'CR24B', batchScope: 'ALL' },

    // Friday
    { dayOfWeek: 5, startTime: '08:00', endTime: '10:00', code: '26AF1246PC501', room: 'CR OS CR1', batchScope: 'ALL' },
    { dayOfWeek: 5, startTime: '10:00', endTime: '12:00', code: '25AF1MACOEMO5(X)', room: 'CR1', batchScope: 'ALL' },
    { dayOfWeek: 5, startTime: '12:00', endTime: '14:00', code: '26AF1246PCL504', room: 'DBMSL LAB-V 5TH FLR SBMP', batchScope: 'IT1' },

    // Saturday
    { dayOfWeek: 6, startTime: '08:00', endTime: '12:00', code: '26AF1246ELC510', room: 'UB', batchScope: 'ALL' },
  ],
};
