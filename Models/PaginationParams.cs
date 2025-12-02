namespace StudentManagement.Models
{
    public class PaginationParams
    {
        private int _pageSize = 10;

        public int PageNumber { get; set; } = 1;
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value;
        }
    }

}
