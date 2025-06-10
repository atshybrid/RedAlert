# Locations API Documentation

This module provides comprehensive CRUD operations for managing geographical locations in a hierarchical structure.

## Hierarchy

```
Country
└── State
    └── District
        └── Constituency
            └── Mandal
```

## Authentication & Authorization

All endpoints require JWT authentication. Create/Update/Delete operations require specific roles:
- **Admin**: Full access to all operations
- **Desk**: Can create, read, and update (no delete)
- **Reporter**: Read-only access

## API Endpoints

### Countries

#### Base URL: `/api/locations/countries`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET    | `/` | Get all countries | Any authenticated user |
| GET    | `/:id` | Get country by ID with states | Any authenticated user |
| POST   | `/` | Create new country | Admin, Desk |
| PATCH  | `/:id` | Update country | Admin, Desk |
| DELETE | `/:id` | Delete country | Admin only |

**Create Country Request:**
```json
{
  "name": "India",
  "code": "IN"
}
```

**Response Format:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "Country created successfully",
  "data": {
    "id": 1,
    "name": "India",
    "code": "IN",
    "states": [],
    "_count": {
      "states": 0,
      "reporters": 0
    }
  }
}
```

### States

#### Base URL: `/api/locations/states`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET    | `/` | Get all states (optional ?countryId filter) | Any authenticated user |
| GET    | `/:id` | Get state by ID with districts | Any authenticated user |
| POST   | `/` | Create new state | Admin, Desk |
| PATCH  | `/:id` | Update state | Admin, Desk |
| DELETE | `/:id` | Delete state | Admin only |

#### Nested Route: `/api/locations/countries/:countryId/states`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET    | `/` | Get all states in a country | Any authenticated user |

**Create State Request:**
```json
{
  "name": "Telangana",
  "code": "TS",
  "countryId": 1
}
```

### Districts

#### Base URL: `/api/locations/districts`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET    | `/` | Get all districts (optional ?stateId filter) | Any authenticated user |
| GET    | `/:id` | Get district by ID with constituencies | Any authenticated user |
| POST   | `/` | Create new district | Admin, Desk |
| PATCH  | `/:id` | Update district | Admin, Desk |
| DELETE | `/:id` | Delete district | Admin only |

#### Nested Route: `/api/locations/states/:stateId/districts`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET    | `/` | Get all districts in a state | Any authenticated user |

**Create District Request:**
```json
{
  "name": "Hyderabad",
  "stateId": 1
}
```

### Constituencies

#### Base URL: `/api/locations/constituencies`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET    | `/` | Get all constituencies (optional ?districtId filter) | Any authenticated user |
| GET    | `/:id` | Get constituency by ID with mandals | Any authenticated user |
| POST   | `/` | Create new constituency | Admin, Desk |
| PATCH  | `/:id` | Update constituency | Admin, Desk |
| DELETE | `/:id` | Delete constituency | Admin only |

#### Nested Route: `/api/locations/districts/:districtId/constituencies`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET    | `/` | Get all constituencies in a district | Any authenticated user |

**Create Constituency Request:**
```json
{
  "name": "Secunderabad",
  "districtId": 1
}
```

### Mandals

#### Base URL: `/api/locations/mandals`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET    | `/` | Get all mandals (optional ?constituencyId filter) | Any authenticated user |
| GET    | `/:id` | Get mandal by ID | Any authenticated user |
| POST   | `/` | Create new mandal | Admin, Desk |
| PATCH  | `/:id` | Update mandal | Admin, Desk |
| DELETE | `/:id` | Delete mandal | Admin only |

#### Nested Route: `/api/locations/constituencies/:constituencyId/mandals`

| Method | Endpoint | Description | Required Role |
|--------|----------|-------------|---------------|
| GET    | `/` | Get all mandals in a constituency | Any authenticated user |

**Create Mandal Request:**
```json
{
  "name": "Begumpet",
  "constituencyId": 1
}
```

## Features

### 1. Hierarchical Validation
- Ensures parent entities exist before creating child entities
- Prevents deletion of entities with dependent children

### 2. Duplicate Prevention
- Prevents duplicate names within the same parent scope
- Example: Two states with same name in different countries are allowed

### 3. Comprehensive Responses
- All responses include related entities and counts
- Consistent error handling and messaging

### 4. Flexible Querying
- Support for both direct endpoints and nested routes
- Optional filtering by parent entity

### 5. Data Integrity
- Cascade validation prevents orphaned records
- Proper foreign key relationships maintained

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "Country not found",
  "data": {}
}
```

Common error scenarios:
- **404**: Entity not found
- **409**: Duplicate name conflict
- **400**: Cannot delete entity with dependencies
- **401**: Unauthorized access
- **403**: Insufficient permissions

## Usage Examples

### Creating a Complete Location Hierarchy

1. **Create Country:**
```bash
POST /api/locations/countries
{
  "name": "India",
  "code": "IN"
}
```

2. **Create State:**
```bash
POST /api/locations/states
{
  "name": "Telangana",
  "code": "TS",
  "countryId": 1
}
```

3. **Create District:**
```bash
POST /api/locations/districts
{
  "name": "Hyderabad",
  "stateId": 1
}
```

4. **Create Constituency:**
```bash
POST /api/locations/constituencies
{
  "name": "Secunderabad",
  "districtId": 1
}
```

5. **Create Mandal:**
```bash
POST /api/locations/mandals
{
  "name": "Begumpet",
  "constituencyId": 1
}
```

### Querying Hierarchical Data

```bash
# Get all states in India
GET /api/locations/countries/1/states

# Get all districts in Telangana
GET /api/locations/states/1/districts

# Get all constituencies in Hyderabad
GET /api/locations/districts/1/constituencies

# Get all mandals in Secunderabad
GET /api/locations/constituencies/1/mandals
```
