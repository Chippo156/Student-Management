using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using StudentManagement.Data;
using StudentManagement.Hubs;
using StudentManagement.Models;
using StudentManagement.Models.Dto.Request;
using StudentManagement.Services;
using StudentManagement.Services.Interface;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
  options.UseSqlServer(builder.Configuration.GetConnectionString("StudentManagement")));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidIssuer = builder.Configuration["AppSettings:Issuer"],
                        ValidateAudience = true,
                        ValidAudience = builder.Configuration["AppSettings:Audience"],
                        ValidateLifetime = true,
                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"]!)),
                    };
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = context =>
                        {
                            var accessToken = context.Request.Query["access_token"];

                            var path = context.HttpContext.Request.Path;

                            if (!string.IsNullOrEmpty(accessToken) &&
                                path.StartsWithSegments("/chathub"))
                            {
                                context.Token = accessToken;
                            }

                            return Task.CompletedTask;
                        }
                    };
                }
                );

builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
builder.Services.AddScoped<IFileService, FileService>();

builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddScoped<ILecturerService, LecturerService>();
builder.Services.AddScoped<IAdviserAssignmentService, AdviserAssignmentService>();
builder.Services.AddScoped<ICourseService, CourseService>();
builder.Services.AddScoped<IClassService, ClassService>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<ISectionService, SectionService>();
builder.Services.AddScoped<IAssessmentService, AssessmentService>();
builder.Services.AddScoped<IFacultyService, FacultyService>();
builder.Services.AddScoped<IAcademicProgramService, AcademicProgramService>();
builder.Services.AddScoped<ICurriculumCourseService, CurriculumCourseService>();
builder.Services.AddScoped<IPrerequisiteService, PrerequisiteService>();
builder.Services.AddScoped<IScheduleService, ScheduleService>();
builder.Services.AddScoped<IDocumentTypeService, DocumentTypeService>();
builder.Services.AddScoped<IDocumentRequestService, DocumentRequestService>();
builder.Services.AddScoped<IEnrollmentService, EnrollmentService>();
builder.Services.AddScoped<IFinalResultService, FinalResultService>();
builder.Services.AddScoped<IGpaSnapshotService, GpaSnapshotService>();
builder.Services.AddScoped<IGradeService, GradeService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<ISemesterService, SemesterService>();
builder.Services.AddScoped<IBankAccountService, BankAccountService>();
builder.Services.AddScoped<IFamilyRelationshipService, FamilyRelationshipService>();
builder.Services.AddScoped<IPracticeGroupService, PracticeGroupService>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();
builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ITuitionService, TuitionService>();
// Register HttpClient for GeminiAIService
builder.Services.AddHttpClient<IGeminiAIService, GeminiAIService>();

// Register other services
builder.Services.AddScoped<IGeminiAIService, GeminiAIService>();
// Add SignalR
builder.Services.AddSignalR();

// Register chat service
builder.Services.AddScoped<IChatService, ChatService>();

builder.Services.AddHttpContextAccessor();

// Restrict origins and allow credentials for SignalR negotiate with credentials: 'include'
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());   // QUAN TRỌNG
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
    {
        options.Title = "Student Management API";
        options.Theme = ScalarTheme.BluePlanet;
        options.DefaultHttpClient = new(ScalarTarget.CSharp, ScalarClient.HttpClient);
    });
}

app.UseCors("AllowAll");

app.UseWebSockets();

app.UseHttpsRedirection();

// Ensure authentication middleware is enabled before authorization
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Configure SignalR hub (CORS already applied)
app.MapHub<ChatHub>("/chathub");

app.Run();