const LANG_STORAGE_KEY = 'aya_lang';

const translations = {
  en: {
    // Auth pages
    'app.name': 'Aya Learn',
    'app.tagline': 'Your journey in Quran memorization starts here',
    'login.title': 'Welcome Back',
    'login.subtitle': 'Log in to your account',
    'login.email': 'Email',
    'login.email_placeholder': 'you@example.com',
    'login.password': 'Password',
    'login.password_placeholder': 'Enter your password',
    'login.remember': 'Remember me',
    'login.forgot': 'Forgot password?',
    'login.submit': 'Log In',
    'login.or': 'or',
    'login.google': 'Continue with Google',
    'login.no_account': "Don't have an account?",
    'login.signup_link': 'Sign Up',
    'signup.title': 'Create Account',
    'signup.subtitle': 'Start your Quran learning journey',
    'signup.name': 'Full Name',
    'signup.name_placeholder': 'Your full name',
    'signup.role': 'I want to join as',
    'signup.role_teacher': 'Teacher',
    'signup.role_student': 'Student',
    'signup.submit': 'Sign Up',
    'signup.or': 'or',
    'signup.google': 'Continue with Google',
    'signup.has_account': 'Already have an account?',
    'signup.login_link': 'Log In',

    // Sidebar / Nav
    'nav.overview': 'Overview',
    'nav.users': 'Users',
    'nav.pending_teachers': 'Pending Teachers',
    'nav.classes': 'Classes',
    'nav.reports': 'Reports',
    'nav.settings': 'Settings',
    'nav.sessions': 'My Sessions',
    'nav.students': 'My Students',
    'nav.scores': 'Score Students',
    'nav.profile': 'My Profile',
    'nav.browse_teachers': 'Browse Teachers',
    'nav.dashboard': 'Dashboard',
    'nav.logout': 'Log Out',
    'nav.requests': 'Requests',
    'nav.pending': 'Pending',
    'nav.upcoming': 'Upcoming',
    'nav.completed': 'Completed',

    // Dashboard
    'dashboard.admin_title': 'Admin Dashboard',
    'dashboard.teacher_title': 'Teacher Dashboard',
    'dashboard.stats.total_users': 'Total Users',
    'dashboard.stats.teachers': 'Teachers',
    'dashboard.stats.students': 'Students',
    'dashboard.stats.active_classes': 'Active Classes',
    'dashboard.stats.my_classes': 'My Classes',
    'dashboard.stats.avg_score': 'Avg Score',
    'dashboard.stats.scores_given': 'Scores Given',
    'dashboard.stats.total_scores': 'Total Scores',
    'dashboard.stats.juz_memorized': 'Juz Memorized',
    'dashboard.stats.active_days': 'Active Days',
    'dashboard.stats.total_students': 'Total Students',
    'dashboard.recent_activity': 'Recent Activity',
    'dashboard.recent_registrations': 'Recent Registrations',
    'dashboard.no_activity': 'No recent activity.',
    'dashboard.no_registrations': 'No registrations.',
    'dashboard.pending_title': 'Pending Sessions',
    'dashboard.upcoming_title': 'Upcoming Sessions',
    'dashboard.completed_title': 'Completed Sessions',
    'dashboard.session_requests': 'Session Requests',
    'dashboard.no_pending': 'No pending sessions.',
    'dashboard.no_upcoming': 'No upcoming sessions.',
    'dashboard.no_completed': 'No completed sessions.',
    'dashboard.my_students': 'My Students',

    // User management
    'users.title': 'User Management',
    'users.search': 'Search users...',
    'users.all_roles': 'All Roles',
    'users.table.user': 'User',
    'users.table.role': 'Role',
    'users.table.email': 'Email',
    'users.table.joined': 'Joined',
    'users.table.status': 'Status',
    'users.table.actions': 'Actions',
    'users.active': 'Active',
    'users.pending': 'Pending',

    // Classes
    'classes.title': 'Class Management',
    'classes.add': 'Add Class',
    'classes.table.name': 'Class Name',
    'classes.table.teacher': 'Teacher',
    'classes.table.students': 'Students',
    'classes.table.schedule': 'Schedule',
    'classes.table.status': 'Status',
    'classes.table.actions': 'Actions',

    // Sessions
    'sessions.title': 'My Sessions',
    'sessions.book_with': 'Booking with:',
    'sessions.price': 'Price:',
    'sessions.date_time': 'Date & Time',
    'sessions.duration': 'Duration (minutes)',
    'sessions.duration_30': '30 minutes',
    'sessions.duration_60': '60 minutes',
    'sessions.duration_90': '90 minutes',
    'sessions.notes': 'Notes (optional)',
    'sessions.notes_placeholder': 'What would you like to focus on?',
    'sessions.confirm': 'Confirm Booking',
    'sessions.suggest_time': 'Suggest a Specific Time',
    'sessions.available_slots': 'Available Slots',
    'sessions.no_slots': 'No available slots this week.',
    'sessions.add_meet_link': 'Add Meet Link',
    'sessions.meet_link': 'Google Meet Link',
    'sessions.meet_link_placeholder': 'https://meet.google.com/xxx-xxxx-xxx',
    'sessions.share_start': 'Share Link & Start Session',
    'sessions.leave_review': 'Leave Review',
    'sessions.accept': 'Accept',
    'sessions.decline': 'Decline',
    'sessions.cancel': 'Cancel',
    'sessions.complete': 'Complete',
    'sessions.remove': 'Remove',
    'sessions.join_meeting': 'Join Meeting',
    'sessions.booked_alert': 'Session booked! Waiting for teacher to accept.',
    'sessions.accepted_alert': 'Session accepted!',
    'sessions.completed_alert': 'Session completed!',
    'sessions.complete_no_score': 'Complete Without Score',
    'sessions.link_shared': 'Meet link shared with student!',
    'sessions.review_submitted': 'Review submitted!',
    'sessions.reject_reason': 'Reason (optional):',

    // Scores
    'scores.title': 'Score Student Recitation',
    'scores.select_student': 'Select Student',
    'scores.choose_student': 'Choose a student',
    'scores.portion': 'Surah / Juz',
    'scores.portion_placeholder': 'e.g., Surah Al-Fatiha',
    'scores.tajweed': 'Tajweed Score (out of 100)',
    'scores.memorization': 'Memorization Score (out of 100)',
    'scores.fluency': 'Fluency Score (out of 100)',
    'scores.overall': 'Overall Score (auto-calculated)',
    'scores.overall_calc': 'Will be calculated',
    'scores.comments': 'Comments',
    'scores.comments_placeholder': 'Feedback for the student...',
    'scores.submit': 'Submit Score',
    'scores.submitted_alert': 'Score submitted!',
    'scores.quick_score': 'Quick Score',
    'scores.portion_recited': 'Portion Recited',
    'scores.notes_quick': 'Notes',
    'scores.notes_quick_placeholder': 'Quick feedback...',

    // Teacher Profile
    'teacher.profile_title': 'My Teaching Profile',
    'teacher.price': 'Price Per Session ($)',
    'teacher.price_placeholder': '15.00',
    'teacher.specializations': 'Specializations',
    'teacher.spec_placeholder': 'e.g., Tajweed, Hifz, Qiraat',
    'teacher.experience': 'Years of Experience',
    'teacher.exp_placeholder': '5',
    'teacher.languages': 'Languages',
    'teacher.lang_placeholder': 'e.g., English, Arabic, Urdu',
    'teacher.available': 'Available for Sessions',
    'teacher.yes': 'Yes',
    'teacher.no': 'No',
    'teacher.save': 'Save Profile',
    'teacher.saved_alert': 'Profile saved!',
    'teacher.availability': 'Weekly Availability Slots',
    'teacher.day': 'Day of Week',
    'teacher.start_time': 'Start Time',
    'teacher.end_time': 'End Time',
    'teacher.add_slot': 'Add Slot',
    'teacher.no_slots': 'No slots added yet.',
    'teacher.price_label': 'Price:',
    'teacher.experience_label': 'Experience:',
    'teacher.languages_label': 'Languages:',
    'teacher.specializations_label': 'Specializations:',
    'teacher.reviews': 'Reviews',
    'teacher.no_reviews': 'No reviews yet.',
    'teacher.book': 'Book a Session',
    'teacher.approve': 'Approve',
    'teacher.reject': 'Reject',
    'teacher.approve_alert': 'Teacher approved!',
    'teacher.no_pending': 'No pending teacher registrations.',
    'teacher.registered': 'Registered',

    // Student
    'student.overview': 'Student Overview',
    'student.scores': 'My Scores',
    'student.portions': 'My Portions',
    'student.no_scores': 'No scores yet.',
    'student.no_portions': 'No portions yet.',
    'student.due': 'Due',
    'student.completed': 'Completed',
    'student.pending': 'Pending',
    'student.memorized': 'Memorized',
    'student.in_progress': 'In Progress',
    'student.not_started': 'Not Started',

    // Settings
    'settings.title': 'Profile Settings',
    'settings.name': 'Full Name',
    'settings.email': 'Email',
    'settings.phone': 'Phone',
    'settings.phone_placeholder': '+1 234 567 890',
    'settings.bio': 'Bio',
    'settings.bio_placeholder': 'Tell students about yourself...',
    'settings.save': 'Save Changes',
    'settings.saved_alert': 'Saved!',
    'settings.language': 'Language',

    // Common
    'common.save': 'Save Changes',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.error': 'Error:',
    'common.or': 'or',
    'common.confirm_delete': 'Delete this user?',
    'common.confirm_cancel': 'Cancel this session?',
    'common.confirm_remove_slot': 'Remove this slot?',
    'common.confirm_reject': 'Reject this teacher?',
    'common.confirm_book': 'Book this slot with',
    'common.confirm_delete_class': 'Delete this class?',
    'common.deleted_alert': 'Deleted!',

    // Reviews
    'review.title': 'Leave a Review',
    'review.rating': 'Rating',
    'review.comment': 'Comment (optional)',
    'review.comment_placeholder': 'How was your session?',
    'review.submit': 'Submit Review',
    'review.select_rating': 'Please select a rating',

    // Pending / Status
    'pending.approval': 'Your account is pending admin approval. Please wait for an administrator to activate your account.',
    'pending.register_success': 'Registration successful. Your account is pending admin approval.',
    'pending.teachers_title': 'Pending Teacher Approvals',

    // Pagination / Filters
    'filter.search_teachers': 'Search teachers...',
    'filter.all_specs': 'All Specializations',
    'filter.all_prices': 'Any Price',
    'filter.search_students': 'Search students...',

    // Availability
    'avail.sunday': 'Sunday',
    'avail.monday': 'Monday',
    'avail.tuesday': 'Tuesday',
    'avail.wednesday': 'Wednesday',
    'avail.thursday': 'Thursday',
    'avail.friday': 'Friday',
    'avail.saturday': 'Saturday',

    // Members
    'members.no_members': 'No members yet.',

    // Common time strings
    'common.time_just_now': 'Just now',
    'common.time_min_ago': '{0}m ago',
    'common.time_hour_ago': '{0}h ago',
    'common.time_day_ago': '{0}d ago',
    'common.no_comments': 'No comments',
    'common.no_comment': 'No comment',
    'common.per_session': '/ session',
    'common.years_experience': '{0} years experience',
    'common.available': 'Available',
    'common.book_now': 'Book Now',

    // Session status badges
    'sessions.status_pending': 'Pending',
    'sessions.status_accepted': 'Accepted',
    'sessions.status_ongoing': 'Ongoing',
    'sessions.status_completed': 'Completed',
    'sessions.status_rejected': 'Rejected',
    'sessions.status_cancelled': 'Cancelled',

    // Teacher fallback values
    'teacher.new_label': 'New',
    'teacher.quran_teacher': 'Quran teacher',
    'teacher.english': 'English',
    'teacher.general': 'General',
  },

  ar: {
    // Auth pages
    'app.name': 'آية ليرن',
    'app.tagline': 'رحلتك في حفظ القرآن تبدأ من هنا',
    'login.title': 'مرحباً بعودتك',
    'login.subtitle': 'تسجيل الدخول إلى حسابك',
    'login.email': 'البريد الإلكتروني',
    'login.email_placeholder': 'you@example.com',
    'login.password': 'كلمة المرور',
    'login.password_placeholder': 'أدخل كلمة المرور',
    'login.remember': 'تذكرني',
    'login.forgot': 'نسيت كلمة المرور؟',
    'login.submit': 'تسجيل الدخول',
    'login.or': 'أو',
    'login.google': 'المتابعة عبر Google',
    'login.no_account': 'ليس لديك حساب؟',
    'login.signup_link': 'إنشاء حساب',
    'signup.title': 'إنشاء حساب',
    'signup.subtitle': 'ابدأ رحلة تعلم القرآن',
    'signup.name': 'الاسم الكامل',
    'signup.name_placeholder': 'اسمك الكامل',
    'signup.email': 'البريد الإلكتروني',
    'signup.password': 'كلمة المرور',
    'signup.role': 'أريد الانضمام كـ',
    'signup.role_teacher': 'معلم',
    'signup.role_student': 'طالب',
    'signup.submit': 'إنشاء حساب',
    'signup.or': 'أو',
    'signup.google': 'المتابعة عبر Google',
    'signup.has_account': 'لديك حساب بالفعل؟',
    'signup.login_link': 'تسجيل الدخول',

    // Sidebar / Nav
    'nav.overview': 'نظرة عامة',
    'nav.users': 'المستخدمون',
    'nav.pending_teachers': 'المعلمون المعلقون',
    'nav.classes': 'الفصول',
    'nav.reports': 'التقارير',
    'nav.settings': 'الإعدادات',
    'nav.sessions': 'جلساتي',
    'nav.students': 'طلابي',
    'nav.scores': 'تقييم الطلاب',
    'nav.profile': 'ملفي الشخصي',
    'nav.browse_teachers': 'تصفح المعلمين',
    'nav.dashboard': 'لوحة التحكم',
    'nav.logout': 'تسجيل الخروج',
    'nav.requests': 'الطلبات',
    'nav.pending': 'معلق',
    'nav.upcoming': 'القادمة',
    'nav.completed': 'المكتملة',

    // Dashboard
    'dashboard.admin_title': 'لوحة تحكم المشرف',
    'dashboard.teacher_title': 'لوحة تحكم المعلم',
    'dashboard.stats.total_users': 'إجمالي المستخدمين',
    'dashboard.stats.teachers': 'المعلمون',
    'dashboard.stats.students': 'الطلاب',
    'dashboard.stats.active_classes': 'الفصول النشطة',
    'dashboard.stats.my_classes': 'فصولي',
    'dashboard.stats.avg_score': 'متوسط الدرجات',
    'dashboard.stats.scores_given': 'التقييمات المقدمة',
    'dashboard.stats.total_scores': 'إجمالي التقييمات',
    'dashboard.stats.juz_memorized': 'الأجزاء المحفوظة',
    'dashboard.stats.active_days': 'الأيام النشطة',
    'dashboard.stats.total_students': 'إجمالي الطلاب',
    'dashboard.recent_activity': 'النشاط الأخير',
    'dashboard.recent_registrations': 'التسجيلات الأخيرة',
    'dashboard.no_activity': 'لا يوجد نشاط حديث.',
    'dashboard.no_registrations': 'لا توجد تسجيلات.',
    'dashboard.pending_title': 'الجلسات المعلقة',
    'dashboard.upcoming_title': 'الجلسات القادمة',
    'dashboard.completed_title': 'الجلسات المكتملة',
    'dashboard.session_requests': 'طلبات الجلسات',
    'dashboard.no_pending': 'لا توجد جلسات معلقة.',
    'dashboard.no_upcoming': 'لا توجد جلسات قادمة.',
    'dashboard.no_completed': 'لا توجد جلسات مكتملة.',
    'dashboard.my_students': 'طلابي',

    // User management
    'users.title': 'إدارة المستخدمين',
    'users.search': 'البحث عن مستخدمين...',
    'users.all_roles': 'جميع الأدوار',
    'users.table.user': 'المستخدم',
    'users.table.role': 'الدور',
    'users.table.email': 'البريد الإلكتروني',
    'users.table.joined': 'تاريخ الانضمام',
    'users.table.status': 'الحالة',
    'users.table.actions': 'الإجراءات',
    'users.active': 'نشط',
    'users.pending': 'معلق',

    // Classes
    'classes.title': 'إدارة الفصول',
    'classes.add': 'إضافة فصل',
    'classes.table.name': 'اسم الفصل',
    'classes.table.teacher': 'المعلم',
    'classes.table.students': 'الطلاب',
    'classes.table.schedule': 'الجدول',
    'classes.table.status': 'الحالة',
    'classes.table.actions': 'الإجراءات',

    // Sessions
    'sessions.title': 'جلساتي',
    'sessions.book_with': 'الحجز مع:',
    'sessions.price': 'السعر:',
    'sessions.date_time': 'التاريخ والوقت',
    'sessions.duration': 'المدة (بالدقائق)',
    'sessions.duration_30': '30 دقيقة',
    'sessions.duration_60': '60 دقيقة',
    'sessions.duration_90': '90 دقيقة',
    'sessions.notes': 'ملاحظات (اختياري)',
    'sessions.notes_placeholder': 'على ماذا تريد التركيز؟',
    'sessions.confirm': 'تأكيد الحجز',
    'sessions.suggest_time': 'اقتراح وقت محدد',
    'sessions.available_slots': 'المواعيد المتاحة',
    'sessions.no_slots': 'لا توجد مواعيد متاحة هذا الأسبوع.',
    'sessions.add_meet_link': 'إضافة رابط Meet',
    'sessions.meet_link': 'رابط Google Meet',
    'sessions.meet_link_placeholder': 'https://meet.google.com/xxx-xxxx-xxx',
    'sessions.share_start': 'مشاركة الرابط وبدء الجلسة',
    'sessions.leave_review': 'ترك تقييم',
    'sessions.accept': 'قبول',
    'sessions.decline': 'رفض',
    'sessions.cancel': 'إلغاء',
    'sessions.complete': 'إكمال',
    'sessions.remove': 'إزالة',
    'sessions.join_meeting': 'انضمام للاجتماع',
    'sessions.booked_alert': 'تم حجز الجلسة! في انتظار قبول المعلم.',
    'sessions.accepted_alert': 'تم قبول الجلسة!',
    'sessions.completed_alert': 'تم إكمال الجلسة!',
    'sessions.complete_no_score': 'إكمال بدون تقييم',
    'sessions.link_shared': 'تم مشاركة رابط Meet مع الطالب!',
    'sessions.review_submitted': 'تم إرسال التقييم!',
    'sessions.reject_reason': 'السبب (اختياري):',

    // Scores
    'scores.title': 'تقييم تلاوة الطالب',
    'scores.select_student': 'اختر الطالب',
    'scores.choose_student': 'اختر طالباً',
    'scores.portion': 'السورة / الجزء',
    'scores.portion_placeholder': 'مثال: سورة الفاتحة',
    'scores.tajweed': 'درجة التجويد (من 100)',
    'scores.memorization': 'درجة الحفظ (من 100)',
    'scores.fluency': 'درجة الطلاقة (من 100)',
    'scores.overall': 'الدرجة الإجمالية (تحسب تلقائياً)',
    'scores.overall_calc': 'سيتم حسابها',
    'scores.comments': 'تعليقات',
    'scores.comments_placeholder': 'ملاحظات للطالب...',
    'scores.submit': 'إرسال التقييم',
    'scores.submitted_alert': 'تم إرسال التقييم!',
    'scores.quick_score': 'تقييم سريع',
    'scores.portion_recited': 'الجزء المقروء',
    'scores.notes_quick': 'ملاحظات',
    'scores.notes_quick_placeholder': 'ملاحظات سريعة...',

    // Teacher Profile
    'teacher.profile_title': 'ملفي التعليمي',
    'teacher.price': 'السعر لكل جلسة ($)',
    'teacher.price_placeholder': '15.00',
    'teacher.specializations': 'التخصصات',
    'teacher.spec_placeholder': 'مثال: تجويد، حفظ، قراءات',
    'teacher.experience': 'سنوات الخبرة',
    'teacher.exp_placeholder': '5',
    'teacher.languages': 'اللغات',
    'teacher.lang_placeholder': 'مثال: العربية، الإنجليزية',
    'teacher.available': 'متاح للجلسات',
    'teacher.yes': 'نعم',
    'teacher.no': 'لا',
    'teacher.save': 'حفظ الملف',
    'teacher.saved_alert': 'تم حفظ الملف!',
    'teacher.availability': 'المواعيد الأسبوعية المتاحة',
    'teacher.day': 'اليوم',
    'teacher.start_time': 'وقت البداية',
    'teacher.end_time': 'وقت النهاية',
    'teacher.add_slot': 'إضافة موعد',
    'teacher.no_slots': 'لم تتم إضافة مواعيد بعد.',
    'teacher.price_label': 'السعر:',
    'teacher.experience_label': 'الخبرة:',
    'teacher.languages_label': 'اللغات:',
    'teacher.specializations_label': 'التخصصات:',
    'teacher.reviews': 'التقييمات',
    'teacher.no_reviews': 'لا توجد تقييمات بعد.',
    'teacher.book': 'حجز جلسة',
    'teacher.approve': 'قبول',
    'teacher.reject': 'رفض',
    'teacher.approve_alert': 'تم قبول المعلم!',
    'teacher.no_pending': 'لا توجد تسجيلات معلمين معلقة.',
    'teacher.registered': 'تاريخ التسجيل',

    // Student
    'student.overview': 'نظرة عامة للطالب',
    'student.scores': 'نتائجي',
    'student.portions': 'مهامي',
    'student.no_scores': 'لا توجد نتائج بعد.',
    'student.no_portions': 'لا توجد مهام بعد.',
    'student.due': 'مستحق',
    'student.completed': 'مكتمل',
    'student.pending': 'معلق',
    'student.memorized': 'محفوظ',
    'student.in_progress': 'قيد التقدم',
    'student.not_started': 'لم يبدأ',

    // Settings
    'settings.title': 'إعدادات الملف الشخصي',
    'settings.name': 'الاسم الكامل',
    'settings.email': 'البريد الإلكتروني',
    'settings.phone': 'الهاتف',
    'settings.phone_placeholder': '+1 234 567 890',
    'settings.bio': 'السيرة الذاتية',
    'settings.bio_placeholder': 'أخبر الطلاب عن نفسك...',
    'settings.save': 'حفظ التغييرات',
    'settings.saved_alert': 'تم الحفظ!',
    'settings.language': 'اللغة',

    // Common
    'common.save': 'حفظ التغييرات',
    'common.submit': 'إرسال',
    'common.cancel': 'إلغاء',
    'common.delete': 'حذف',
    'common.edit': 'تعديل',
    'common.search': 'بحث',
    'common.loading': 'جاري التحميل...',
    'common.error': 'خطأ:',
    'common.or': 'أو',
    'common.confirm_delete': 'حذف هذا المستخدم؟',
    'common.confirm_cancel': 'إلغاء هذه الجلسة؟',
    'common.confirm_remove_slot': 'إزالة هذا الموعد؟',
    'common.confirm_reject': 'رفض هذا المعلم؟',
    'common.confirm_book': 'حجز هذا الموعد مع',
    'common.confirm_delete_class': 'حذف هذا الفصل؟',
    'common.deleted_alert': 'تم الحذف!',

    // Reviews
    'review.title': 'ترك تقييم',
    'review.rating': 'التقييم',
    'review.comment': 'تعليق (اختياري)',
    'review.comment_placeholder': 'كيف كانت جلساتك؟',
    'review.submit': 'إرسال التقييم',
    'review.select_rating': 'الرجاء اختيار تقييم',

    // Pending / Status
    'pending.approval': 'حسابك معلق بانتظار موافقة المشرف. الرجاء الانتظار حتى يقوم المشرف بتفعيل حسابك.',
    'pending.register_success': 'تم التسجيل بنجاح. حسابك معلق بانتظار موافقة المشرف.',
    'pending.teachers_title': 'موافقات المعلمين المعلقة',

    // Pagination / Filters
    'filter.search_teachers': 'البحث عن معلمين...',
    'filter.all_specs': 'جميع التخصصات',
    'filter.all_prices': 'أي سعر',
    'filter.search_students': 'البحث عن طلاب...',

    // Availability
    'avail.sunday': 'الأحد',
    'avail.monday': 'الإثنين',
    'avail.tuesday': 'الثلاثاء',
    'avail.wednesday': 'الأربعاء',
    'avail.thursday': 'الخميس',
    'avail.friday': 'الجمعة',
    'avail.saturday': 'السبت',

    // Members
    'members.no_members': 'لا يوجد أعضاء بعد.',

    // Common time strings
    'common.time_just_now': 'الآن',
    'common.time_min_ago': 'منذ {0} دقيقة',
    'common.time_hour_ago': 'منذ {0} ساعة',
    'common.time_day_ago': 'منذ {0} يوم',
    'common.no_comments': 'لا توجد تعليقات',
    'common.no_comment': 'لا يوجد تعليق',
    'common.per_session': '/ الجلسة',
    'common.years_experience': '{0} سنوات خبرة',
    'common.available': 'متاح',
    'common.book_now': 'احجز الآن',

    // Session status badges
    'sessions.status_pending': 'معلقة',
    'sessions.status_accepted': 'مقبولة',
    'sessions.status_ongoing': 'جارٍ',
    'sessions.status_completed': 'مكتملة',
    'sessions.status_rejected': 'مرفوضة',
    'sessions.status_cancelled': 'ملغاة',

    // Teacher fallback values
    'teacher.new_label': 'جديد',
    'teacher.quran_teacher': 'معلم قرآن',
    'teacher.english': 'الإنجليزية',
    'teacher.general': 'عام',
  }
};

function getLang() {
  return localStorage.getItem(LANG_STORAGE_KEY) || 'en';
}

function setLang(lang) {
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', lang === 'ar');
  translatePage();
}

function t(key, ...args) {
  const lang = getLang();
  let val = (translations[lang] && translations[lang][key]) || (translations.en && translations.en[key]) || key;
  if (args.length) {
    args.forEach((arg, i) => { val = val.replace(`{${i}}`, arg); });
  }
  return val;
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const attr = el.dataset.i18nAttr || 'textContent';
    if (attr === 'textContent') {
      el.textContent = t(key);
    } else {
      el.setAttribute(attr, t(key));
    }
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll('[data-i18n-value]').forEach(el => {
    el.value = t(el.dataset.i18nValue);
  });
}

function initLang() {
  const saved = getLang();
  setLang(saved);
}

function injectLangSwitcher() {
  const container = document.querySelector('.topbar-actions') || document.querySelector('.topbar');
  if (!container || document.getElementById('langSwitcher')) return;

  const btn = document.createElement('button');
  btn.id = 'langSwitcher';
  btn.className = 'btn-icon lang-switcher';
  btn.innerHTML = '<i class="fas fa-globe"></i>';
  btn.title = t('settings.language');
  btn.addEventListener('click', () => {
    const current = getLang();
    setLang(current === 'en' ? 'ar' : 'en');
    btn.title = t('settings.language');
  });

  container.insertBefore(btn, container.firstChild);
}

document.addEventListener('DOMContentLoaded', () => {
  initLang();
  injectLangSwitcher();
});
