# Simple Geology

Мінімальний навчальний проєкт для курсової з 3-шаровою архітектурою:

- `Client-React` - UI на React + Vite
- `API_net` - Web API (контролери, DTO, DI)
- `BLL_net` - бізнес-логіка, моделі, інтерфейси сервісу та репозиторію
- `DAL_net` - in-memory реалізація репозиторію
- `UnitTests` - xUnit тести для BLL

## Зв'язки між шарами

- API -> BLL (`IGeologicalObjectService`, `GeologicalObjectService`)
- API -> DAL (`InMemoryGeologicalObjectRepository` через DI)
- DAL -> BLL (`IGeologicalObjectRepository`, доменні моделі)
- UnitTests -> BLL
- Client-React -> API (`/api/geologicalobjects`)

## Налаштування секретів (User Secrets)

Застосунок використовує [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets) для зберігання чутливої інформації поза репозиторієм. Без секретів backend не запуститься.

### 1. Перейдіть до проєкту API

```bash
cd API_net/API_net
```

### 2. Встановіть обов'язкові секрети

```bash
# Рядок підключення до бази даних (PostgreSQL)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=SimpleGeologyDb;Username=postgres;Password=YOUR_PASSWORD"

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
