# Admin & Inventory Module

This folder contains only the Admin & Inventory part of the Online Book Inventory & Reservation System.

Stack:
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB + Mongoose

Features:
1. Admin Dashboard
2. Book Management - add, view, edit, delete
3. Inventory - total, available, reserved stock
4. User Management - view users, activate/deactivate
5. Reservation Management - view and update reservation status

Important:
- This module is intentionally standalone so each team member can develop independently.
- Authentication is NOT included because it belongs to the Authentication teammate.
- The User and Reservation models/routes here are local supporting versions for standalone testing. When the team combines modules, replace/merge them with the team's shared User and Reservation models/routes.
