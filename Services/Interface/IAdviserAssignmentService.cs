using StudentManagement.Models;
using System.Threading.Tasks;

namespace StudentManagement.Services.Interface
{
    public interface IAdviserAssignmentService
    {
        Task<bool> AssignLecturerToClass(int lecturerId, int classId);
        Task<Lecturer?> GetLecturerByAdviser(int adviserId);
    }
}
