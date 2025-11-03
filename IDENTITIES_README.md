# Identities API Documentation

This document describes the `/identities` Edge Function endpoint that provides org-scoped identity listing for the IGA platform.

## Endpoint

**GET** `/functions/v1/identities`

## Authentication

Requires a valid JWT token in the Authorization header. The endpoint uses Row Level Security (RLS) to ensure users only see identities within their current organization.

## Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Case-insensitive search across name, email, and department |
| `filters` | JSON string | No | - | JSON object containing filter criteria |
| `sort` | string | No | `name:asc` | Sort column and direction (e.g., `last_login_at:desc`) |
| `page` | number | No | `1` | Page number (1-based) |
| `pageSize` | number | No | `25` | Items per page (max 100) |

### Filter Options

The `filters` parameter accepts a JSON object with the following optional properties:

```json
{
  "department": "Engineering",
  "status": "active",
  "risk": "high",
  "dormant": true
}
```

| Filter | Type | Description |
|--------|------|-------------|
| `department` | string | Filter by department name |
| `status` | string | Filter by user status |
| `risk` | string | Filter by risk level |
| `dormant` | boolean | Filter by dormant status (last login > 30 days) |

### Sort Options

Supported sort columns:
- `name` - User's full name
- `email` - User's email address
- `department` - Department name
- `status` - User status
- `risk_level` - Risk level
- `last_login_at` - Last login timestamp
- `role_count` - Number of assigned roles

Sort direction: `asc` or `desc`

## Response Format

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john.doe@company.com",
      "department": "Engineering",
      "manager_name": "Jane Smith",
      "status": "active",
      "risk_level": "low",
      "risk_score": 0,
      "role_count": 2,
      "last_login_at": "2025-10-25T10:11:12Z",
      "flags_count": 0,
      "has_dormant": false
    }
  ],
  "pageInfo": {
    "page": 1,
    "pageSize": 25,
    "total": 123,
    "hasNextPage": true
  }
}
```

## Usage Examples

### Basic listing
```bash
curl -H "Authorization: Bearer <jwt_token>" \
  "https://your-project.supabase.co/functions/v1/identities"
```

### Search with pagination
```bash
curl -H "Authorization: Bearer <jwt_token>" \
  "https://your-project.supabase.co/functions/v1/identities?search=john&page=2&pageSize=10"
```

### Filtered results
```bash
curl -H "Authorization: Bearer <jwt_token>" \
  "https://your-project.supabase.co/functions/v1/identities?filters=%7B%22department%22%3A%22Engineering%22%2C%22status%22%3A%22active%22%7D"
```

### Sorted by last login
```bash
curl -H "Authorization: Bearer <jwt_token>" \
  "https://your-project.supabase.co/functions/v1/identities?sort=last_login_at:desc"
```

## Implementation Notes

### Row Level Security (RLS)

The endpoint enforces tenant isolation through RLS policies:

- All queries use the user's JWT token (not service role)
- The `current_org_id()` function extracts the organization ID from JWT claims
- Views automatically filter results to the user's current organization
- No cross-tenant data leakage is possible

### Placeholder Fields

The following fields are currently placeholder implementations and will be enhanced in future iterations:

- **Risk Assessment**: `risk_level` and `risk_score` are hardcoded to "low" and 0
- **User Flags**: `flags_count` and `has_dormant` are hardcoded to 0 and false
- **Last Login**: `last_login_at` is currently null (auth.sessions not accessible from public schema)
- **Department**: Currently hardcoded to "Engineering" (will be moved to user attributes)
- **Manager**: `manager_name` is null (manager relationships not yet implemented)

### Audit Logging

Every request generates an audit log entry in the `audit_logs` table with:
- Action: `identities_list_read`
- Subject: `identities`
- Metadata: search terms, filters, sort options, pagination, and result count
- No PII is stored in audit metadata

### Performance Considerations

- Views use efficient joins and indexes on organization-scoped queries
- Pagination limits prevent large result sets
- Search uses PostgreSQL ILIKE for case-insensitive matching
- Sort column validation prevents SQL injection

## Error Responses

| Status | Description |
|--------|-------------|
| 401 | Missing or invalid authorization header |
| 400 | Invalid filters JSON or sort parameter |
| 500 | Database query failed or internal server error |

## Future Enhancements

1. **Risk Engine Integration**: Connect to risk assessment service for real risk scores
2. **Flag System**: Implement anomaly detection and flagging system
3. **Login Tracking**: Add user_logins table for accurate last login data
4. **Department Management**: Move department to user attributes table
5. **Manager Relationships**: Implement manager hierarchy with manager_id foreign key
6. **Advanced Search**: Add full-text search capabilities
7. **Export Features**: Add CSV/Excel export functionality
