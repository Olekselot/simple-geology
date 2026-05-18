# Simple Geology

Навчальний проєкт курсової роботи — інформаційна система класифікації та пошуку геологічних об'єктів (мінерали, гірські породи). Реалізує 3-шарову архітектуру з React-фронтендом і .NET 9 бекендом на PostgreSQL.

## Структура рішення

| Проєкт                    | Призначення                                                       |
| ------------------------- | ----------------------------------------------------------------- |
| `Client-React`            | SPA-інтерфейс (React 19 + Vite + TypeScript)                      |
| `API_net`                 | ASP.NET Core Web API — контролери, DTO, налаштування DI та CORS   |
| `BLL_net`                 | Бізнес-логіка — моделі, інтерфейси сервісу та репозиторію         |
| `DAL_net`                 | Доступ до даних — EF Core контекст, сутності, міграції PostgreSQL |
| `UnitTests/BLL_net.Tests` | Модульні тести xUnit для BLL                                      |

## Зв'язки між шарами

- API → BLL: `IGeologicalObjectService` / `GeologicalObjectService`
- API → DAL: `EfGeologicalObjectRepository` через DI (реалізує `IGeologicalObjectRepository`)
- DAL → BLL: залежить від абстракцій та доменних моделей BLL
- Frontend → API: `http://localhost:5033/api/geologicalobjects`

## Налаштування секретів (User Secrets)

Застосунок використовує [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) для зберігання чутливої інформації поза репозиторієм. Без секретів backend не запуститься.

### 1. Перейдіть до проєкту API

```bash
cd API_net/API_net
```

### 2. Встановіть обов'язкові секрети

```bash
# Рядок підключення до бази даних (PostgreSQL)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=GeologyDB;Username=postgres;Password=YOUR_PASSWORD"

# Секрет для підпису JWT-токенів (мінімум 32 символи)
dotnet user-secrets set "AppSecrets:JwtSecretKey" "YOUR_JWT_SECRET_KEY_MIN_32_CHARS"

# Ключ API (необов'язковий)
dotnet user-secrets set "AppSecrets:ApiKey" "YOUR_API_KEY"
```

> Секрети зберігаються локально в `%APPDATA%\Microsoft\UserSecrets\simple-geology-api\secrets.json` і **не потрапляють до git**.

### 3. Перевірте збережені секрети

```bash
dotnet user-secrets list
```

## База даних однією командою (create/update)

Підхід у проєкті: Code-First + EF Core Migrations.

Одна команда для створення або оновлення схеми БД:

```bash
dotnet ef database update --project DAL_net/DAL_net/DAL_net.csproj --startup-project API_net/API_net/API_net.csproj
```

Що робить команда:

- якщо БД порожня, створює всі таблиці, індекси та view
- якщо міграції вже частково застосовані, дотягує тільки нові

## Як змінювати схему далі

1. Оновити EF моделі та конфігурацію в `GeologyDbContext`.
2. Створити нову міграцію:

```bash
dotnet ef migrations add <MigrationName> --project DAL_net/DAL_net/DAL_net.csproj --startup-project API_net/API_net/API_net.csproj --output-dir Persistence/Migrations
```

3. Застосувати її:

```bash
dotnet ef database update --project DAL_net/DAL_net/DAL_net.csproj --startup-project API_net/API_net/API_net.csproj
```

---

## Як запустити

1. Backend (після налаштування секретів):

```bash
dotnet run --project API_net/API_net/API_net.csproj
```

2. Frontend:

```bash
cd Client-React
npm install
npm run dev
```

За замовчуванням React звертається до `http://localhost:5033/api/geologicalobjects`.
