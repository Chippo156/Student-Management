namespace StudentManagement.Exceptions
{
    public static class ErrorCodes
    {
        public const int UnknownError = 1000;
        public const int ValidationError = 1001;

        public const int Unauthorized = 2000;
        public const int Forbidden = 2001;

        public const int NotFound = 3000;
        public const int Conflict = 3001;

        public const int InternalServerError = 5000;

        public const int BadRequest = 400;
    }

}
