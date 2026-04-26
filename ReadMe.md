# 📘 Subscription Contract API

## Overview
The **Subscription Contract API** enables applications to manage recurring billing agreements between service providers and customers. It supports creating, updating, retrieving, and canceling subscription contracts.

---

## Authentication
- **API Key**: Include in request headers (`Authorization: Bearer <token>`).
- **OAuth 2.0**: For secure delegated access.

---

## Endpoints

| Endpoint            | Method | Description                  |
|---------------------|--------|------------------------------|
| `/contracts`        | POST   | Create a new subscription    |
| `/contracts/{id}`   | GET    | Retrieve contract details    |
| `/contracts/{id}`   | PUT    | Update contract terms        |
| `/contracts/{id}`   | DELETE | Cancel a subscription        |

---

## Data Models

### Contract Object
```json
{
  "id": "sub_12345",
  "customer_id": "cust_67890",
  "plan_id": "plan_basic",
  "status": "active",
  "start_date": "2026-04-27",
  "renewal_date": "2026-05-27",
  "billing_cycle": "monthly"
}- [PiRC1: Pi Ecosystem Token Design](./PiRC1/ReadMe.md)
- [PiRC2: Subscription Contract API](./PiRC2/ReadMe.md)
