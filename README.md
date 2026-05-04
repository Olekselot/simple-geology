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

## Як запустити

1. Backend:

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
