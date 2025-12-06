import finalResultService from './finalResultService';
import curriculumCourseService from './curriculumCourseService';

const graduationService = {
  /**
   * Tính toán tiến độ tốt nghiệp dựa trên điểm và chương trình đào tạo
   */
  calculateGraduationProgress: async () => {
    try {
      // Lấy tất cả điểm của sinh viên
      const gradesData = await finalResultService.getMyAllGrades();

      if (!gradesData) {
        return null;
      }

      // Phân tích dữ liệu điểm
      const grades = Array.isArray(gradesData) ? gradesData : [];

      // Tính tổng tín chỉ đã hoàn thành (điểm >= 4.0 hoặc C)
      const passedCourses = grades.filter(grade => {
        // Kiểm tra điểm đạt: >= 4.0 hoặc grade letter >= C
        const score = grade.finalScore || grade.score || 0;
        const gradeLetter = grade.gradeLetter || '';
        return score >= 4.0 || ['A', 'B+', 'B', 'C+', 'C'].includes(gradeLetter);
      });

      const totalCreditsCompleted = passedCourses.reduce((sum, course) => {
        return sum + (course.credits || course.credit || 0);
      }, 0);

      // Phân loại môn học
      const requiredCourses = passedCourses.filter(c => c.courseType === 'Bắt buộc' || c.isRequired === true);
      const electiveCourses = passedCourses.filter(c => c.courseType === 'Tự chọn' || c.isElective === true);
      const physicalEducation = passedCourses.filter(c =>
        c.courseName?.includes('Giáo dục thể chất') ||
        c.courseCode?.includes('GDTC') ||
        c.courseName?.includes('GDTC')
      );

      const requiredCredits = requiredCourses.reduce((sum, c) => sum + (c.credits || c.credit || 0), 0);
      const electiveCredits = electiveCourses.reduce((sum, c) => sum + (c.credits || c.credit || 0), 0);

      // Giả định yêu cầu tốt nghiệp (có thể customize theo từng trường)
      const graduationRequirements = {
        requiredCredits: 100,  // Tín chỉ bắt buộc
        electiveCredits: 30,   // Tín chỉ tự chọn
        totalCredits: 130,      // Tổng tín chỉ
        physicalEducation: 4,   // Số môn GDTC
        languageCertificate: 1, // Chứng chỉ ngoại ngữ
        thesis: 1,              // Khóa luận
        internship: 1,          // Thực tập
      };

      // Tạo danh sách yêu cầu với tiến độ
      const requirements = [
        {
          id: '1',
          category: 'Tín chỉ bắt buộc',
          requirement: 'Tín chỉ các môn bắt buộc',
          completed: requiredCredits,
          total: graduationRequirements.requiredCredits,
          status: requiredCredits >= graduationRequirements.requiredCredits ? 'completed' : 'in-progress',
          description: requiredCredits >= graduationRequirements.requiredCredits
            ? 'Đã hoàn thành đủ tín chỉ bắt buộc'
            : `Còn thiếu ${graduationRequirements.requiredCredits - requiredCredits} tín chỉ môn bắt buộc`,
        },
        {
          id: '2',
          category: 'Tín chỉ tự chọn',
          requirement: 'Tín chỉ các môn tự chọn',
          completed: electiveCredits,
          total: graduationRequirements.electiveCredits,
          status: electiveCredits >= graduationRequirements.electiveCredits ? 'completed' : 'in-progress',
          description: electiveCredits >= graduationRequirements.electiveCredits
            ? 'Đã hoàn thành đủ tín chỉ tự chọn'
            : `Còn thiếu ${graduationRequirements.electiveCredits - electiveCredits} tín chỉ môn tự chọn`,
        },
        {
          id: '3',
          category: 'Ngoại ngữ',
          requirement: 'Chứng chỉ Tiếng Anh B1',
          completed: 0, // Cần API riêng hoặc field trong student data
          total: 1,
          status: 'not-started',
          description: 'Chưa có thông tin chứng chỉ ngoại ngữ',
        },
        {
          id: '4',
          category: 'Giáo dục thể chất',
          requirement: 'Hoàn thành môn GDTC',
          completed: physicalEducation.length,
          total: graduationRequirements.physicalEducation,
          status: physicalEducation.length >= graduationRequirements.physicalEducation ? 'completed' : 'in-progress',
          description: physicalEducation.length >= graduationRequirements.physicalEducation
            ? `Đã hoàn thành đủ ${graduationRequirements.physicalEducation} môn GDTC`
            : `Còn thiếu ${graduationRequirements.physicalEducation - physicalEducation.length} môn GDTC`,
        },
        {
          id: '5',
          category: 'Khóa luận',
          requirement: 'Khóa luận tốt nghiệp',
          completed: 0, // Cần API riêng
          total: 1,
          status: 'not-started',
          description: 'Chưa có thông tin đăng ký khóa luận',
        },
        {
          id: '6',
          category: 'Thực tập',
          requirement: 'Thực tập tốt nghiệp',
          completed: 0, // Cần API riêng
          total: 1,
          status: 'not-started',
          description: 'Chưa có thông tin thực tập',
        },
      ];

      // Tính tổng tiến độ
      const totalCompleted = requirements.reduce((sum, req) => sum + req.completed, 0);
      const totalRequired = requirements.reduce((sum, req) => sum + req.total, 0);
      const overallProgress = Math.round((totalCompleted / totalRequired) * 100);

      return {
        requirements,
        totalCreditsCompleted,
        totalCreditsRequired: graduationRequirements.totalCredits,
        overallProgress,
        passedCoursesCount: passedCourses.length,
        totalCoursesCount: grades.length,
      };
    } catch (error) {
      console.error('Error calculating graduation progress:', error);
      return null;
    }
  },

  /**
   * Tạo timeline milestones mặc định dựa trên tiến độ
   */
  getDefaultMilestones: (currentProgress) => {
    const today = new Date();
    const milestones = [];

    // Milestone: Hoàn thành học phần
    if (currentProgress < 100) {
      milestones.push({
        id: '1',
        title: 'Hoàn thành học phần còn lại',
        date: new Date(today.getFullYear(), today.getMonth() + 3, 15).toISOString().split('T')[0],
        status: 'upcoming',
        description: 'Hoàn thành các môn học còn thiếu',
        documents: [],
      });
    }

    // Milestone: Đăng ký khóa luận
    milestones.push({
      id: '2',
      title: 'Đăng ký khóa luận tốt nghiệp',
      date: new Date(today.getFullYear(), today.getMonth() + 4, 1).toISOString().split('T')[0],
      status: 'upcoming',
      description: 'Đăng ký đề tài và giảng viên hướng dẫn',
      documents: ['Đơn đăng ký khóa luận', 'Đề cương khóa luận'],
    });

    // Milestone: Nộp hồ sơ
    milestones.push({
      id: '3',
      title: 'Nộp hồ sơ xét tốt nghiệp',
      date: new Date(today.getFullYear(), today.getMonth() + 6, 15).toISOString().split('T')[0],
      status: 'upcoming',
      description: 'Nộp hồ sơ xét tốt nghiệp tại phòng đào tạo',
      documents: [
        'Đơn xin xét tốt nghiệp',
        'Bản sao bằng tốt nghiệp THPT',
        'Chứng chỉ ngoại ngữ',
      ],
    });

    return milestones;
  },
};

export default graduationService;
