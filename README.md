# Public API Documentation

This document outlines the public APIs available for the client frontend to fetch photographer/partner information without exposing sensitive data.

## Base URL
\`\`\`
/api/v1/public
\`\`\`

## Rate Limiting
- **Limit**: 200 requests per 15 minutes per IP
- **Headers**: Standard rate limit headers included in responses

## Security
- No authentication required for public endpoints
- Sensitive information (email, phone, documents, etc.) is automatically filtered out
- Only verified partners are returned

---

## Endpoints

### 1. Get All Partners (with Pagination & Filters)

**GET** `/partners`

Fetch all verified partners with comprehensive filtering and pagination options.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (min: 1) |
| `limit` | integer | 12 | Items per page (min: 1, max: 50) |
| `search` | string | - | Search in company name, username, specializations, locations |
| `location` | string | - | Filter by serving location |
| `specialization` | string | - | Filter by specialization |
| `partnerType` | string | - | Filter by partner type (studio, solo, firm, partnership) |
| `minRating` | number | - | Minimum average rating (0-5) |
| `maxPrice` | number | - | Maximum service price |
| `minPrice` | number | - | Minimum service price |
| `sortBy` | string | avgRating | Sort field (avgRating, experienceYears, totalReviews, createdAt, companyName) |
| `sortOrder` | string | desc | Sort order (asc, desc) |
| `servingLocation` | string | - | Alternative to location parameter |

#### Response

\`\`\`json
{
  "success": true,
  "data": {
    "partners": [
      {
        "_id": "partner_id",
        "companyName": "Amazing Photography Studio",
        "specializations": ["wedding_photography", "portrait_photography"],
        "experienceYears": 5,
        "avgRating": 4.8,
        "totalReviews": 127,
        "verified": true,
        "partnerType": "studio",
        "servingLocations": ["Mumbai", "Pune"],
        "partnerLocations": [
          {
            "city": "Mumbai",
            "state": "Maharashtra",
            "coordinates": { "lat": 19.0760, "lng": 72.8777 }
          }
        ],
        "portfolio": ["image1.jpg", "image2.jpg"],
        "banner": "banner.jpg",
        "socialLinks": {
          "website": "https://example.com",
          "instagram": "username"
        },
        "projectStats": {
          "total": 150,
          "completed": 145,
          "ongoing": 5
        },
        "services": [
          {
            "serviceId": "service_id",
            "name": "Wedding Photography",
            "description": "Complete wedding coverage",
            "basePrice": 50000,
            "priceUnit": "per_day"
          }
        ],
        "user": {
          "username": "photographer_username",
          "profilePic": "profile.jpg"
        },
        "completionRate": 96.67,
        "hasLocationPricing": true,
        "createdAt": "2023-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "pages": 4,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "locations": ["Mumbai", "Delhi", "Bangalore"],
      "specializations": ["wedding_photography", "portrait_photography"],
      "partnerTypes": ["studio", "solo", "firm"],
      "ratingRanges": [
        { "_id": "4.5+", "count": 15 },
        { "_id": "4.0+", "count": 25 }
      ],
      "priceRanges": [
        { "_id": "Under ₹10,000", "count": 5 },
        { "_id": "₹10,000 - ₹25,000", "count": 12 }
      ]
    },
    "appliedFilters": {
      "search": null,
      "location": null,
      "specialization": null,
      "partnerType": null,
      "minRating": null,
      "minPrice": null,
      "maxPrice": null,
      "sortBy": "avgRating",
      "sortOrder": "desc"
    }
  }
}
\`\`\`

---

### 2. Get Single Partner Profile

**GET** `/partners/:partnerId`

Fetch detailed information about a specific partner.

#### Response

\`\`\`json
{
  "success": true,
  "data": {
    "partner": {
      "_id": "partner_id",
      "companyName": "Amazing Photography Studio",
      "specializations": ["wedding_photography", "portrait_photography"],
      "experienceYears": 5,
      "avgRating": 4.8,
      "totalReviews": 127,
      "verified": true,
      "partnerType": "studio",
      "servingLocations": ["Mumbai", "Pune"],
      "partnerLocations": [
        {
          "city": "Mumbai",
          "state": "Maharashtra",
          "coordinates": { "lat": 19.0760, "lng": 72.8777 },
          "pinCodesServed": ["400001", "400002"]
        }
      ],
      "portfolio": ["image1.jpg", "image2.jpg", "image3.jpg"],
      "banner": "banner.jpg",
      "socialLinks": {
        "website": "https://example.com",
        "instagram": "username",
        "facebook": "page_name"
      },
      "projectStats": {
        "total": 150,
        "completed": 145,
        "ongoing": 5
      },
      "services": [
        {
          "serviceId": "service_id",
          "name": "Wedding Photography",
          "description": "Complete wedding coverage with edited photos",
          "basePrice": 50000,
          "priceUnit": "per_day"
        }
      ],
      "locationPricing": {
        "Mumbai": 0,
        "Pune": 5000
      },
      "user": {
        "username": "photographer_username",
        "profilePic": "profile.jpg",
        "createdAt": "2022-01-15T10:30:00.000Z"
      },
      "completionRate": 96.67,
      "yearsInBusiness": 2.1,
      "createdAt": "2023-01-15T10:30:00.000Z"
    },
    "similarPartners": [
      {
        "_id": "similar_partner_id",
        "companyName": "Another Studio",
        "specializations": ["wedding_photography"],
        "avgRating": 4.5,
        "totalReviews": 89,
        "partnerType": "studio",
        "portfolio": ["img1.jpg", "img2.jpg", "img3.jpg"],
        "user": {
          "username": "another_photographer",
          "profilePic": "profile2.jpg"
        }
      }
    ]
  }
}
\`\`\`

---

### 3. Get Partner Portfolio

**GET** `/partners/:partnerId/portfolio`

Fetch paginated portfolio images for a specific partner.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 12 | Images per page |

#### Response

\`\`\`json
{
  "success": true,
  "data": {
    "images": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ],
    "companyName": "Amazing Photography Studio",
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 45,
      "pages": 4,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
\`\`\`

---

### 4. Get Filter Options

**GET** `/partners/filters/options`

Get all available filter options for the frontend.

#### Response

\`\`\`json
{
  "success": true,
  "data": {
    "filters": {
      "locations": ["Mumbai", "Delhi", "Bangalore", "Chennai"],
      "specializations": [
        "wedding_photography",
        "portrait_photography",
        "event_photography",
        "commercial_photography"
      ],
      "partnerTypes": ["studio", "solo", "firm", "partnership"],
      "ratingRanges": [
        { "_id": "4.5+", "count": 15 },
        { "_id": "4.0+", "count": 25 },
        { "_id": "3.5+", "count": 35 },
        { "_id": "3.0+", "count": 40 }
      ],
      "priceRanges": [
        { "_id": "Under ₹10,000", "count": 5 },
        { "_id": "₹10,000 - ₹25,000", "count": 12 },
        { "_id": "₹25,000 - ₹50,000", "count": 18 },
        { "_id": "₹50,000 - ₹1,00,000", "count": 8 },
        { "_id": "₹1,00,000+", "count": 3 }
      ]
    }
  }
}
\`\`\`

---

### 5. Search Suggestions

**GET** `/partners/search/suggestions`

Get search suggestions based on query input.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (min 2 characters) |

#### Response

\`\`\`json
{
  "success": true,
  "data": {
    "suggestions": {
      "partners": [
        {
          "_id": "partner_id",
          "companyName": "Amazing Photography",
          "specializations": ["wedding_photography"],
          "avgRating": 4.8,
          "user": {
            "username": "photographer",
            "profilePic": "profile.jpg"
          }
        }
      ],
      "locations": ["Mumbai", "Pune"],
      "specializations": ["wedding_photography", "portrait_photography"]
    }
  }
}
\`\`\`

---

### 6. Featured Partners

**GET** `/partners/featured`

Get top-rated partners for homepage/featured sections.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `limit` | integer | 8 | Number of partners to return |

#### Response

\`\`\`json
{
  "success": true,
  "data": {
    "partners": [
      {
        "_id": "partner_id",
        "companyName": "Top Photography Studio",
        "specializations": ["wedding_photography", "portrait_photography"],
        "avgRating": 4.9,
        "totalReviews": 156,
        "partnerType": "studio",
        "servingLocations": ["Mumbai", "Delhi"],
        "portfolio": ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg"],
        "banner": "banner.jpg",
        "user": {
          "username": "top_photographer",
          "profilePic": "profile.jpg"
        },
        "completionRate": 98.5
      }
    ]
  }
}
\`\`\`

---

### 7. Partners by Location

**GET** `/partners/by-location/:location`

Get partners serving a specific location.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 12 | Partners per page |
| `sortBy` | string | avgRating | Sort field |
| `sortOrder` | string | desc | Sort order |

#### Response

\`\`\`json
{
  "success": true,
  "data": {
    "partners": [
      {
        "_id": "partner_id",
        "companyName": "Local Photography Studio",
        "specializations": ["wedding_photography"],
        "avgRating": 4.7,
        "totalReviews": 89,
        "partnerType": "studio",
        "experienceYears": 3,
        "portfolio": ["img1.jpg", "img2.jpg", "img3.jpg"],
        "user": {
          "username": "local_photographer",
          "profilePic": "profile.jpg"
        }
      }
    ],
    "location": "Mumbai",
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 25,
      "pages": 3
    }
  }
}
\`\`\`

---

### 8. Platform Statistics

**GET** `/stats`

Get public platform statistics.

#### Response

\`\`\`json
{
  "success": true,
  "data": {
    "totalPartners": 156,
    "averageRating": 4.3,
    "locationsServed": 45,
    "specializations": 12,
    "totalProjects": 2847
  }
}
\`\`\`

---

## Data Security

### Protected Fields
The following fields are **never** exposed in public APIs:
- User email addresses
- Phone numbers
- Physical addresses
- Document information
- Internal dashboard data
- Firebase UIDs
- Admin verification details
- Rejection reasons/notes

### Exposed Fields
Only the following information is available publicly:
- Company/business name
- Username (public handle)
- Profile pictures
- Portfolio images
- Specializations
- Service locations
- Ratings and reviews count
- Experience years
- Services and pricing
- Social media links
- Project statistics (aggregated)
- Partner type (studio/solo/etc.)

---

## Error Responses

All endpoints return consistent error responses:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "details": "Additional error details (in development)"
}
\`\`\`

### Common HTTP Status Codes
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

---

## Usage Examples

### Frontend Integration

\`\`\`javascript
// Fetch partners with filters
const fetchPartners = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(`/api/v1/public/partners?${params}`);
  return response.json();
};

// Get partner profile
const getPartnerProfile = async (partnerId) => {
  const response = await fetch(`/api/v1/public/partners/${partnerId}`);
  return response.json();
};

// Search suggestions
const getSearchSuggestions = async (query) => {
  const response = await fetch(`/api/v1/public/partners/search/suggestions?q=${query}`);
  return response.json();
};
\`\`\`

### React Hook Example

\`\`\`javascript
import { useState, useEffect } from 'react';

const usePartners = (filters) => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(filters);
        const response = await fetch(`/api/v1/public/partners?${params}`);
        const data = await response.json();
        
        if (data.success) {
          setPartners(data.data.partners);
          setPagination(data.data.pagination);
        }
      } catch (error) {
        console.error('Failed to fetch partners:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  return { partners, loading, pagination };
};
#   c r e a t e s c o . c l i e n t 
 
 #   c r e a t e s c o . c l i e n t 
 
 #   c r e a t e s c o . c l i e n t 
 
 #   c r e a t e s c o . c l i e n t 
 
 