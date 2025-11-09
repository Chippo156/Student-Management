export const parseModalSchedule = (record) => {
  return (record.dayOfWeek || '').split(',').map((day, idx) => ({
    key: idx + 1,
    dayOfWeekName: day,
    startTime: (record.timeSlot || '').split(',')[idx]?.split('-')[0] || '',
    endTime: (record.timeSlot || '').split(',')[idx]?.split('-')[1] || '',
    room: (record.room || '').split(',')[idx] || '',
    lecturerName: record.lecturerName,
    scheduleTypeName: record.scheduleTypeName || '',
  }));
};

export const tableRowClassName = (
  record,
  idx,
  selectedCourse,
  selectedSection
) => {
  if (selectedCourse && record.key === selectedCourse.curriculumCourseId) {
    return 'table-row-selected';
  }
  if (selectedSection && record.key === selectedSection.sectionId) {
    return 'table-row-selected';
  }
  return idx % 2 === 0 ? 'table-row-light' : 'table-row-dark';
};

export const scheduleRowClassName = (record) => {
  if (record.type?.toLowerCase().includes('thực hành')) {
    return record.isActive
      ? 'schedule-row-thuchanh-active'
      : 'schedule-row-thuchanh';
  }
  return 'schedule-row-lythuyet';
};

export const prepareScheduleData = (
  schedule,
  practiceGroups,
  selectedPracticeGroup
) => {
  const theorySchedule = schedule.map((s, i) => ({
    key: `lythuyet-${i}`,
    index: i + 1,
    groupName: '',
    dayOfWeek: s.dayOfWeekName,
    startTime: s.startTime,
    endTime: s.endTime,
    room: s.room,
    type: s.scheduleTypeName,
    currentCount: '',
    maxCapacity: '',
  }));

  const practiceSchedule = practiceGroups.flatMap((group, gi) =>
    (group.schedules || []).map((s, si) => {
      const [startTime = '', endTime = ''] = (s.timeSlot || '')
        .split('-')
        .map((t) => t.trim());
      return {
        key: `thuchanh-${group.practiceGroupId}-${si}`,
        index: schedule.length + gi + si + 1,
        groupName: group.groupName,
        dayOfWeek: s.dayOfWeek,
        startTime,
        endTime,
        timeSlot: s.timeSlot,
        room: s.room,
        type: s.scheduleType,
        currentCount: group.currentCount,
        maxCapacity: group.maxCapacity,
        isActive: selectedPracticeGroup === group.practiceGroupId,
      };
    })
  );

  return [...theorySchedule, ...practiceSchedule];
};
