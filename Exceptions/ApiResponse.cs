namespace StudentManagement.Exceptions
{
    public class ApiResponse
    {
        public bool Success { get; set; }       // true = thành công, false = lỗi
        public int Code { get; set; }           // mã code (ErrorCodes hoặc SuccessCodes)
        public string Message { get; set; }     // thông báo
        public object? Data { get; set; }       // dữ liệu trả về (nếu có)

        private ApiResponse(bool success, int code, string message, object? data = null)
        {
            Success = success;
            Code = code;
            Message = message;
            Data = data;
        }

        // Factory method cho Success
        public static ApiResponse SuccessResponse(object? data = null, string message = "Success")
        {
            return new ApiResponse(true, SuccessCodes.Ok, message, data);
        }

        // Factory method cho Error
        public static ApiResponse ErrorResponse(int code, string message, object? data = null)
        {
            return new ApiResponse(false, code, message, data);
        }
    }

}
