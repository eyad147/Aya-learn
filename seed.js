require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('./server/db');

function seed() {
  console.log('Seeding database...');

  const hash = bcrypt.hashSync('password123', 10);

  // Clear existing data
  db.exec(`
    DELETE FROM reviews;
    DELETE FROM notifications;
    DELETE FROM sessions;
    DELETE FROM teacher_profiles;
    DELETE FROM scores;
    DELETE FROM portions;
    DELETE FROM juz_progress;
    DELETE FROM class_students;
    DELETE FROM classes;
    DELETE FROM users;
  `);

  // ========================
  // USERS
  // ========================
  const insertUser = db.prepare('INSERT INTO users (name, email, password, role, status, phone, bio) VALUES (?, ?, ?, ?, ?, ?, ?)');

  const admin = insertUser.run('Admin User', 'admin@ayalearn.com', hash, 'admin', 'active', '+1 555 0100', 'Platform administrator');

  const teachers = [
    insertUser.run('Ustadh Ahmad', 'ahmad@ayalearn.com', hash, 'teacher', 'active', '+1 555 0101', '10+ years teaching Quran memorization. Specializes in Tajweed and Hifz.'),
    insertUser.run('Ustadh Khalid', 'khalid@ayalearn.com', hash, 'teacher', 'active', '+1 555 0102', 'Hafiz of 30 Juz. Certified Qari from Al-Azhar.'),
    insertUser.run('Sister Maryam', 'maryam@ayalearn.com', hash, 'teacher', 'active', '+1 555 0103', 'Female Quran teacher with Ijazah in 10 Qiraat.'),
  ];

  const students = [
    insertUser.run('Omar Hassan', 'omar@student.com', hash, 'student', 'active', '+1 555 0201', ''),
    insertUser.run('Fatima Ali', 'fatima@student.com', hash, 'student', 'active', '+1 555 0202', ''),
    insertUser.run('Yusuf Khan', 'yusuf@student.com', hash, 'student', 'active', '+1 555 0203', ''),
    insertUser.run('Aisha Patel', 'aisha@student.com', hash, 'student', 'active', '+1 555 0204', ''),
    insertUser.run('Muhammad Noor', 'muhammad@student.com', hash, 'student', 'active', '+1 555 0205', ''),
    insertUser.run('Zainab Ibrahim', 'zainab@student.com', hash, 'student', 'active', '+1 555 0206', ''),
    insertUser.run('Bilal Syed', 'bilal@student.com', hash, 'student', 'active', '+1 555 0207', ''),
    insertUser.run('Khadija Osman', 'khadija@student.com', hash, 'student', 'active', '+1 555 0208', ''),
    insertUser.run('Ibrahim Yusuf', 'ibrahim@student.com', hash, 'student', 'active', '+1 555 0209', ''),
    insertUser.run('Safiya Ahmed', 'safiya@student.com', hash, 'student', 'active', '+1 555 0210', ''),
    insertUser.run('Hassan Omar', 'hassan@student.com', hash, 'student', 'active', '+1 555 0211', ''),
    insertUser.run('Maryam Yusuf', 'maryam.s@student.com', hash, 'student', 'active', '+1 555 0212', ''),
  ];

  const tIds = teachers.map(t => t.lastInsertRowid);
  const sIds = students.map(s => s.lastInsertRowid);

  // ========================
  // CLASSES
  // ========================
  const insertClass = db.prepare('INSERT INTO classes (name, teacher_id, schedule, time, max_students) VALUES (?, ?, ?, ?, ?)');

  const classes = [
    insertClass.run('Juz Amma Mastery', tIds[0], 'Sun, Tue, Thu', '10:00 AM', 15),
    insertClass.run('Al-Baqarah Intensive', tIds[0], 'Mon, Wed', '2:00 PM', 10),
    insertClass.run('Tajweed Fundamentals', tIds[1], 'Sat, Sun', '11:00 AM', 20),
    insertClass.run('Women\'s Hifz Circle', tIds[2], 'Tue, Thu', '7:00 PM', 12),
    insertClass.run('Juz 28-30 Review', tIds[1], 'Fri', '4:00 PM', 10),
  ];

  const cIds = classes.map(c => c.lastInsertRowid);

  // ========================
  // CLASS ENROLLMENTS
  // ========================
  const enroll = db.prepare('INSERT OR IGNORE INTO class_students (class_id, student_id) VALUES (?, ?)');

  // Juz Amma Mastery: students 0,1,3,4,5,6
  [0,1,3,4,5,6].forEach(i => enroll.run(cIds[0], sIds[i]));
  // Al-Baqarah Intensive: students 1,2,7,8
  [1,2,7,8].forEach(i => enroll.run(cIds[1], sIds[i]));
  // Tajweed Fundamentals: students 0,2,3,4,9,10
  [0,2,3,4,9,10].forEach(i => enroll.run(cIds[2], sIds[i]));
  // Women's Hifz Circle: students 1,3,5,7,11
  [1,3,5,7,11].forEach(i => enroll.run(cIds[3], sIds[i]));
  // Juz 28-30 Review: students 0,4,6,9
  [0,4,6,9].forEach(i => enroll.run(cIds[4], sIds[i]));

  // ========================
  // SCORES (realistic history)
  // ========================
  const insertScore = db.prepare(
    'INSERT INTO scores (student_id, teacher_id, class_id, portion, tajweed, memorization, fluency, overall, comments, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const scoreData = [
    // Omar Hassan - strong student, Juz Amma
    [sIds[0], tIds[0], cIds[0], 'Juz 30 - An-Naba', 95, 92, 90, 92, 'Excellent recitation, minor madd issue', '2026-07-10 10:30:00'],
    [sIds[0], tIds[0], cIds[0], 'Juz 29 - Al-Mulk', 91, 89, 88, 89, 'Good improvement in ghunnah', '2026-07-07 10:30:00'],
    [sIds[0], tIds[0], cIds[0], 'Juz 28 - Al-Haqqah', 88, 85, 87, 87, 'Solid performance, work on elongation', '2026-07-03 10:30:00'],
    [sIds[0], tIds[0], cIds[2], 'Surah Al-Fatiha', 97, 98, 96, 97, 'MashaAllah perfect recitation', '2026-07-12 11:15:00'],
    [sIds[0], tIds[1], cIds[2], 'Surah Al-Baqarah (Ayah 1-10)', 85, 82, 80, 82, 'Good start, work on pronunciation of ر', '2026-07-05 11:15:00'],

    // Fatima Ali - consistent, Al-Baqarah
    [sIds[1], tIds[0], cIds[1], 'Al-Baqarah Ayah 1-20', 89, 86, 84, 86, 'Good memorization, tajweed needs work on ق', '2026-07-09 14:15:00'],
    [sIds[1], tIds[0], cIds[1], 'Al-Baqarah Ayah 21-40', 87, 90, 85, 87, 'Much better today, keep practicing', '2026-07-06 14:15:00'],
    [sIds[1], tIds[2], cIds[3], 'Juz 28 - Al-Haqqah', 92, 94, 90, 92, 'Beautiful recitation, very emotional delivery', '2026-07-11 19:15:00'],
    [sIds[1], tIds[2], cIds[3], 'Juz 29 - Al-Mulk', 90, 88, 87, 88, 'Good fluency, minor pause issues', '2026-07-08 19:15:00'],

    // Yusuf Khan - struggling, needs review
    [sIds[2], tIds[1], cIds[2], 'Surah Al-Fatiha', 72, 70, 65, 69, 'Needs more practice, review مRules', '2026-07-11 11:15:00'],
    [sIds[2], tIds[0], cIds[1], 'Al-Baqarah Ayah 1-10', 68, 75, 60, 68, 'Struggling with fluency, schedule extra session', '2026-07-08 14:15:00'],

    // Aisha Patel - excellent, completed Juz Amma
    [sIds[3], tIds[2], cIds[3], 'Juz 30 Complete', 98, 97, 96, 97, 'Outstanding! Ready for Ijazah test', '2026-07-12 19:15:00'],
    [sIds[3], tIds[2], cIds[3], 'Juz 29 - Al-Mulk', 96, 95, 94, 95, 'Excellent consistency', '2026-07-09 19:15:00'],
    [sIds[3], tIds[1], cIds[2], 'Surah Al-Baqarah Ayah 1-10', 94, 92, 93, 93, 'Strong start, keep it up', '2026-07-06 11:15:00'],
    [sIds[3], tIds[0], cIds[0], 'Juz 28 - Al-Haqqah', 95, 96, 93, 95, 'SubhanAllah, near perfect', '2026-07-03 10:30:00'],

    // Muhammad Noor - inactive, low scores
    [sIds[4], tIds[1], cIds[2], 'Surah Al-Fatiha', 55, 50, 45, 50, 'Needs significant practice. Come to extra sessions.', '2026-07-02 11:15:00'],

    // Zainab Ibrahim - good progress
    [sIds[5], tIds[0], cIds[0], 'Juz 30 - An-Naba', 82, 80, 78, 80, 'Good improvement, focus on نون الساكنة', '2026-07-11 10:30:00'],
    [sIds[5], tIds[0], cIds[0], 'Juz 29 - Al-Mulk', 79, 76, 75, 77, 'Decent, practice more at home', '2026-07-07 10:30:00'],
    [sIds[5], tIds[2], cIds[3], 'Juz 27 - An-Naba', 80, 78, 76, 78, 'Consistent effort, keep going', '2026-07-04 19:15:00'],

    // Bilal Syed - solid middle
    [sIds[6], tIds[0], cIds[0], 'Juz 30 - Ad-Duha', 86, 84, 82, 84, 'Good recitation, work on speed', '2026-07-10 10:30:00'],
    [sIds[6], tIds[0], cIds[0], 'Juz 29 - Al-Mulk', 83, 81, 80, 81, 'Average performance, needs more hifz time', '2026-07-06 10:30:00'],
    [sIds[6], tIds[1], cIds[4], 'Juz 29 Complete', 88, 85, 83, 85, 'Good review session', '2026-07-11 16:15:00'],

    // Khadija Osman - women's circle, decent
    [sIds[7], tIds[2], cIds[3], 'Juz 28 - Al-Haqqah', 85, 83, 80, 83, 'Good effort, focus on تفخيم', '2026-07-10 19:15:00'],

    // Ibrahim Yusuf - new student
    [sIds[8], tIds[0], cIds[1], 'Al-Baqarah Ayah 1-5', 78, 72, 70, 73, 'New student, showing promise', '2026-07-09 14:15:00'],

    // Safiya Ahmed - improving
    [sIds[9], tIds[1], cIds[2], 'Surah Al-Fatiha', 88, 85, 82, 85, 'Good improvement from last week', '2026-07-12 11:15:00'],
    [sIds[9], tIds[1], cIds[4], 'Juz 30 - An-Naba', 90, 88, 86, 88, 'Nice fluency, well done', '2026-07-05 16:15:00'],

    // Hassan Omar - decent
    [sIds[10], tIds[1], cIds[2], 'Surah Al-Fatiha', 80, 78, 75, 78, 'Average, needs more practice', '2026-07-08 11:15:00'],

    // Maryam Yusuf - quiet but good
    [sIds[11], tIds[2], cIds[3], 'Juz 29 - Al-Mulk', 91, 90, 88, 90, 'Beautiful voice, excellent tajweed', '2026-07-12 19:15:00'],
  ];

  scoreData.forEach(s => insertScore.run(...s));

  // ========================
  // PORTIONS (assigned tasks)
  // ========================
  const insertPortion = db.prepare(
    'INSERT INTO portions (class_id, student_id, title, description, due_date, status) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const portionData = [
    [cIds[0], sIds[0], 'Juz 27 - An-Naba', 'Memorize and recite with proper tajweed', '2026-07-20', 'pending'],
    [cIds[0], sIds[0], 'Juz 28 - Al-Haqqah', 'Complete memorization and schedule review', '2026-07-14', 'completed'],
    [cIds[0], sIds[4], 'Surah Al-Fatiha', 'Perfect recitation from memory', '2026-07-10', 'pending'],
    [cIds[1], sIds[1], 'Al-Baqarah Ayah 41-60', 'New memorization portion', '2026-07-22', 'pending'],
    [cIds[1], sIds[1], 'Al-Baqarah Ayah 21-40', 'Review and recite from memory', '2026-07-15', 'completed'],
    [cIds[1], sIds[2], 'Al-Baqarah Ayah 1-10', 'Basic memorization', '2026-07-18', 'pending'],
    [cIds[2], sIds[0], 'Makharij Practice', 'Practice all articulation points', '2026-07-16', 'pending'],
    [cIds[2], sIds[3], 'Surah Al-Baqarah Ayah 11-20', 'Advanced tajweed rules', '2026-07-21', 'pending'],
    [cIds[3], sIds[3], 'Juz 27 - An-Naba', 'Final review before Ijazah', '2026-07-18', 'pending'],
    [cIds[3], sIds[5], 'Juz 28 - Al-Haqqah', 'Memorize with proper makharij', '2026-07-20', 'pending'],
    [cIds[4], sIds[6], 'Juz 28 - Al-Haqqah', 'Complete review portion', '2026-07-17', 'pending'],
    [cIds[4], sIds[6], 'Juz 29 - Al-Mulk', 'New memorization', '2026-07-24', 'pending'],
  ];

  portionData.forEach(p => insertPortion.run(...p));

  // ========================
  // JUZ PROGRESS
  // ========================
  const insertProgress = db.prepare(
    'INSERT OR IGNORE INTO juz_progress (student_id, juz_number, status) VALUES (?, ?, ?)'
  );

  const studentProgress = {
    0: { memorized: [28,29,30], in_progress: [27], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26] },
    1: { memorized: [29,30], in_progress: [28], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27] },
    2: { memorized: [30], in_progress: [29], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28] },
    3: { memorized: [28,29,30], in_progress: [27], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26] },
    4: { memorized: [30], in_progress: [], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29] },
    5: { memorized: [29,30], in_progress: [28], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27] },
    6: { memorized: [29,30], in_progress: [28], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27] },
    7: { memorized: [30], in_progress: [29], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28] },
    8: { memorized: [], in_progress: [1], not_started: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30] },
    9: { memorized: [30], in_progress: [29], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28] },
    10: { memorized: [30], in_progress: [], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29] },
    11: { memorized: [29,30], in_progress: [28], not_started: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27] },
  };

  for (const [sId, data] of Object.entries(studentProgress)) {
    const sid = sIds[parseInt(sId)];
    data.memorized.forEach(j => insertProgress.run(sid, j, 'memorized'));
    data.in_progress.forEach(j => insertProgress.run(sid, j, 'in_progress'));
    data.not_started.forEach(j => insertProgress.run(sid, j, 'not_started'));
  }

  // ========================
  // TEACHER PROFILES
  // ========================
  const insertProfile = db.prepare(
    'INSERT INTO teacher_profiles (user_id, price_per_session, currency, specializations, years_experience, languages, is_available) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  insertProfile.run(tIds[0], 25, 'USD', 'Tajweed,Hifz,Juz Amma', 10, 'English,Arabic,Urdu', 1);
  insertProfile.run(tIds[1], 30, 'USD', 'Tajweed,Qiraat,Al-Baqarah', 8, 'English,Arabic', 1);
  insertProfile.run(tIds[2], 20, 'USD', 'Hifz,Tajweed,Womens Classes', 6, 'English,Arabic,Malay', 1);

  // ========================
  // TEACHER AVAILABILITY
  // ========================
  const insertAvailability = db.prepare(
    'INSERT INTO teacher_availability (teacher_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)'
  );

  // Ustadh Ahmad: Sun-Wed 9am-12pm, Thu 2pm-5pm
  insertAvailability.run(tIds[0], 0, '09:00', '12:00');
  insertAvailability.run(tIds[0], 1, '09:00', '12:00');
  insertAvailability.run(tIds[0], 2, '09:00', '12:00');
  insertAvailability.run(tIds[0], 3, '09:00', '12:00');
  insertAvailability.run(tIds[0], 4, '14:00', '17:00');

  // Ustadh Khalid: Sat-Mon 10am-2pm, Wed 4pm-7pm
  insertAvailability.run(tIds[1], 6, '10:00', '14:00');
  insertAvailability.run(tIds[1], 0, '10:00', '14:00');
  insertAvailability.run(tIds[1], 1, '10:00', '14:00');
  insertAvailability.run(tIds[1], 3, '16:00', '19:00');

  // Sister Maryam: Tue, Thu 6pm-9pm, Sat 10am-2pm
  insertAvailability.run(tIds[2], 2, '18:00', '21:00');
  insertAvailability.run(tIds[2], 4, '18:00', '21:00');
  insertAvailability.run(tIds[2], 6, '10:00', '14:00');

  // ========================
  // SESSIONS (realistic data)
  // ========================
  const insertSession = db.prepare(
    'INSERT INTO sessions (student_id, teacher_id, scheduled_at, duration_minutes, price, meet_link, status, student_notes, teacher_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  );

  const sessionData = [
    // Completed sessions
    [sIds[0], tIds[0], '2026-07-10 10:00:00', 30, 25, 'https://meet.google.com/abc-defg-hij', 'completed', 'Ready for Juz 28 review', 'Excellent progress', '2026-07-08 14:00:00', '2026-07-10 10:35:00'],
    [sIds[1], tIds[0], '2026-07-09 14:00:00', 45, 25, 'https://meet.google.com/xyz-uvwx-rst', 'completed', 'Need help with Al-Baqarah ayah 41-60', 'Good session, keep practicing', '2026-07-07 09:00:00', '2026-07-09 14:50:00'],
    [sIds[3], tIds[2], '2026-07-11 19:00:00', 30, 20, 'https://meet.google.com/lmn-opqr-stu', 'completed', 'Final review before Ijazah', 'MashaAllah ready for Ijazah', '2026-07-09 11:00:00', '2026-07-11 19:35:00'],
    [sIds[5], tIds[0], '2026-07-07 10:00:00', 30, 25, 'https://meet.google.com/ghi-jklm-nop', 'completed', 'Juz 29 review session', 'Good improvement', '2026-07-05 16:00:00', '2026-07-07 10:35:00'],
    
    // Accepted sessions (upcoming)
    [sIds[0], tIds[0], '2026-07-17 10:00:00', 30, 25, '', 'accepted', 'Review Juz 27', '', '2026-07-14 08:00:00', '2026-07-14 09:00:00'],
    [sIds[1], tIds[0], '2026-07-18 14:00:00', 45, 25, '', 'accepted', 'Continue Al-Baqarah', '', '2026-07-14 10:00:00', '2026-07-14 11:00:00'],
    [sIds[2], tIds[1], '2026-07-19 11:00:00', 30, 30, '', 'accepted', 'Struggling with fluency', '', '2026-07-14 12:00:00', '2026-07-14 13:00:00'],
    
    // Pending sessions (awaiting teacher approval)
    [sIds[4], tIds[1], '2026-07-20 11:00:00', 30, 30, '', 'pending', 'Need extra help with Fatiha', '', '2026-07-14 14:00:00', '2026-07-14 14:00:00'],
    [sIds[6], tIds[0], '2026-07-21 10:00:00', 30, 25, '', 'pending', 'Juz 28 review', '', '2026-07-14 15:00:00', '2026-07-14 15:00:00'],
    
    // Rejected session
    [sIds[7], tIds[2], '2026-07-15 19:00:00', 30, 20, '', 'rejected', 'Need help with tajweed', 'Teacher unavailable at this time', '2026-07-13 09:00:00', '2026-07-13 10:00:00'],
    
    // Cancelled session
    [sIds[9], tIds[1], '2026-07-16 16:00:00', 30, 30, '', 'cancelled', 'Juz 30 review', '', '2026-07-12 08:00:00', '2026-07-14 07:00:00'],
  ];

  const sessionResults = sessionData.map(s => insertSession.run(...s));

  // ========================
  // NOTIFICATIONS
  // ========================
  const insertNotification = db.prepare(
    'INSERT INTO notifications (user_id, type, title, message, link, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  const notificationData = [
    // Teacher notifications
    [tIds[0], 'session_request', 'New Session Request', 'Omar Hassan wants to book a session on 7/17/2026, 10:00 AM', '/sessions.html', 0, '2026-07-14 08:00:00'],
    [tIds[0], 'session_request', 'New Session Request', 'Fatima Ali wants to book a session on 7/18/2026, 2:00 PM', '/sessions.html', 0, '2026-07-14 10:00:00'],
    [tIds[0], 'review', 'New Review', 'Omar Hassan left a 5-star review', '/sessions.html', 1, '2026-07-10 11:00:00'],
    [tIds[1], 'session_request', 'New Session Request', 'Yusuf Khan wants to book a session on 7/19/2026, 11:00 AM', '/sessions.html', 0, '2026-07-14 12:00:00'],
    [tIds[1], 'session_request', 'New Session Request', 'Muhammad Noor wants to book a session on 7/20/2026, 11:00 AM', '/sessions.html', 0, '2026-07-14 14:00:00'],
    [tIds[2], 'review', 'New Review', 'Aisha Patel left a 5-star review', '/sessions.html', 1, '2026-07-11 20:00:00'],
    
    // Student notifications
    [sIds[0], 'session_accepted', 'Session Accepted!', 'Ustadh Ahmad accepted your session on 7/17/2026, 10:00 AM', '/sessions.html', 0, '2026-07-14 09:00:00'],
    [sIds[1], 'session_accepted', 'Session Accepted!', 'Ustadh Ahmad accepted your session on 7/18/2026, 2:00 PM', '/sessions.html', 0, '2026-07-14 11:00:00'],
    [sIds[2], 'session_accepted', 'Session Accepted!', 'Ustadh Khalid accepted your session on 7/19/2026, 11:00 AM', '/sessions.html', 0, '2026-07-14 13:00:00'],
    [sIds[4], 'session_rejected', 'Session Declined', 'Ustadh Khalid declined your session. Reason: Teacher unavailable at this time', '/sessions.html', 1, '2026-07-13 10:00:00'],
    [sIds[7], 'session_rejected', 'Session Declined', 'Sister Maryam declined your session. Reason: Teacher unavailable at this time', '/sessions.html', 0, '2026-07-13 10:00:00'],
    [sIds[9], 'session_cancelled', 'Session Cancelled', 'You cancelled the session on 7/16/2026, 4:00 PM', '/sessions.html', 1, '2026-07-14 07:00:00'],
    [sIds[0], 'session_completed', 'Session Completed', 'Your session has been completed. Please leave a review!', '/sessions.html', 1, '2026-07-10 10:35:00'],
    [sIds[1], 'session_completed', 'Session Completed', 'Your session has been completed. Please leave a review!', '/sessions.html', 1, '2026-07-09 14:50:00'],
    [sIds[3], 'session_completed', 'Session Completed', 'Your session has been completed. Please leave a review!', '/sessions.html', 1, '2026-07-11 19:35:00'],
    [sIds[5], 'session_completed', 'Session Completed', 'Your session has been completed. Please leave a review!', '/sessions.html', 1, '2026-07-07 10:35:00'],
  ];

  notificationData.forEach(n => insertNotification.run(...n));

  // ========================
  // REVIEWS
  // ========================
  const insertReview = db.prepare(
    'INSERT INTO reviews (session_id, student_id, teacher_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  );

  const reviewData = [
    [sessionResults[0].lastInsertRowid, sIds[0], tIds[0], 5, 'Excellent teacher! Very patient and knowledgeable. Helped me improve my tajweed significantly.', '2026-07-10 11:00:00'],
    [sessionResults[1].lastInsertRowid, sIds[1], tIds[0], 4, 'Great session on Al-Baqarah. Teacher explains concepts clearly.', '2026-07-09 15:00:00'],
    [sessionResults[2].lastInsertRowid, sIds[3], tIds[2], 5, 'MashaAllah, Sister Maryam is amazing! Ready for my Ijazah test thanks to her guidance.', '2026-07-11 20:00:00'],
    [sessionResults[3].lastInsertRowid, sIds[5], tIds[0], 4, 'Good review session. Teacher is very encouraging.', '2026-07-07 11:00:00'],
  ];

  reviewData.forEach(r => insertReview.run(...r));

  console.log('Database seeded successfully!');
  console.log('');
  console.log('Test accounts (password: password123):');
  console.log('  Admin:    admin@ayalearn.com');
  console.log('  Teacher:  ahmad@ayalearn.com');
  console.log('  Teacher:  khalid@ayalearn.com');
  console.log('  Teacher:  maryam@ayalearn.com');
  console.log('  Student:  omar@student.com');
  console.log('  Student:  fatima@student.com');
  console.log('  Student:  aisha@student.com');
}

seed();
