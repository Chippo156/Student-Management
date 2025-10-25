namespace StudentManagement.Enum
{
    public enum RelationshipType
    {
        Father = 1,
        Mother = 2,
        Grandfather = 3,
        Grandmother = 4,
        Uncle = 5,
        Aunt = 6,
        Brother = 7,
        Sister = 8,
        Spouse = 9,
        Guardian = 10,
        Other = 11
    }

    public static class RelationshipTypeExtensions
    {
        public static string ToVietnamese(this RelationshipType type)
        {
            return type switch
            {
                RelationshipType.Father => "Cha",
                RelationshipType.Mother => "Mẹ",
                RelationshipType.Grandfather => "Ông nội",
                RelationshipType.Grandmother => "Bà nội",
                RelationshipType.Uncle => "Chú",
                RelationshipType.Aunt => "Cô",
                RelationshipType.Brother => "Anh",
                RelationshipType.Sister => "Chị",
                RelationshipType.Spouse => "Vợ/Chồng",
                RelationshipType.Guardian => "Giám hộ",
                RelationshipType.Other => "Khác",
                _ => "Không xác định"
            };
        }
    }
}