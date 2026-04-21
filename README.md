# Zodia Print Hub

Zodia Print Hub is a multi-tenant, real-time print operations management system designed to run end-to-end production workflows for print businesses.

It centralizes job processing, client management, staff coordination, inventory tracking, deliveries, payments, and external B2B trade into a single event-driven platform with live synchronization across all users.

## Core Architecture

- **Multi-tenant system** (organization-based isolation)
- **Event-driven backend** using Outbox pattern
- **Real-time updates** via WebSockets
- **Transactional safety** with UnitOfWork
- **Normalized frontend state** using Zustand
- **Strict domain boundaries** across all business modules

## Key Modules

- **Jobs Engine** – job creation, assignment, pricing, and lifecycle tracking  
- **Clients** – customer profiles with historical and behavioral data  
- **Staff Management** – assignments, workload, and status tracking  
- **Inventory (Stock)** – material consumption, restocking, and waste tracking  
- **Deliveries** – scheduling, tracking, and fulfillment status  
- **Payments** – ledger-based financial tracking and reconciliation  
- **B2B Layer** – external job push and negotiation workflows  
- **Company Onboarding** – tenant setup and activation flow  

## Realtime System Flow

All state changes follow a consistent pipeline:

1. Database transaction executed
2. Event written to Outbox table
3. Background worker processes events
4. WebSocket broadcast via event bus
5. Frontend sync via `useRealtimeSync` into Zustand store

## Tech Stack

- Next.js (App Router)
- TypeScript
- Prisma + PostgreSQL
- Zustand
- WebSockets (realtime layer)

## Design Principles

- Strong data consistency across tenants
- Event-driven architecture for scalability
- Clear separation of domain logic
- Real-time operational visibility
- Production-first reliability over shortcuts

## Status

Core infrastructure is complete. All major business domains are fully integrated with real-time synchronization and event-driven workflows.
