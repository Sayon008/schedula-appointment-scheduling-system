# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Available Commands

### Development Commands
- `npm run start` - Start the application in production mode
- `npm run start:dev` - Start the application in development mode with watch mode
- `npm run build` - Build the application for production

### Database Commands
The application uses PostgreSQL with TypeORM. Database configuration is in `src/database/typeorm.config.ts`.

## Architecture Overview

### Core Structure
This is a NestJS application for a healthcare appointment scheduling system called "Schedula". The application follows a role-based architecture with two main user types: doctors and patients.

### Database Schema
The application uses a PostgreSQL database with the following entity relationships:

**User Entity** (`src/entities/User.entity.ts`)
- Base entity for authentication with roles ('doctor' or 'patient')
- Contains: id, email, password, first_name, last_name, profile_photo, role
- Has one-to-one relationships with Doctor and Patient entities

**Doctor Entity** (`src/entities/Doctor.entity.ts`)
- Extends User functionality for doctors
- Contains: doctor_id, specialization (enum), years_of_exp, time_slot (Date[])
- Has one-to-many relationship with Appointment
- Specialization enum includes: CARDIOLOGY, DERMATOLOGY, ENDOCRINOLOGY, etc.

**Patient Entity** (`src/entities/Patient.entity.ts`)
- Extends User functionality for patients
- Contains: patient_id, phone_number, age, weight
- Has one-to-many relationship with Appointment
- Note: There's a typo in the property name `appointmnets` (should be `appointments`)

**Appointment Entity** (`src/entities/Appointment.entity.ts`)
- Central entity for appointment management
- Contains: appointment_id, appointment_time, appointmentType (enum), complaint, complaint_details, chat (jsonb), feedback
- Has many-to-one relationships with both Doctor and Patient
- Includes created_at and updated_at timestamps
- AppointmentType enum: CONSULTATION, FOLLOW_UP, EMERGENCY, ROUTINE_CHECKUP, SURGERY

### Database Configuration
- Uses TypeORM with PostgreSQL
- Configuration in `src/database/typeorm.config.ts`
- Environment variables loaded from `.env.development`
- Entities auto-loaded from `src/entities/*.entity.{ts,js}`
- Migrations stored in `src/migrations/`
- Synchronize disabled (uses migrations)

### API Design
The application follows RESTful API design principles as documented in `task3-api-design.md`:
- Authentication endpoints: `/auth/signup`, `/auth/login`, `/auth/logout`
- Doctor profile endpoints: `/doctors/*`
- Patient profile endpoints: `/patients/*`
- Appointment endpoints: `/appointments/*`
- Availability endpoints: `/doctors/{doctor_id}/availability`

### Current Implementation Status
- Basic NestJS application structure is set up
- Database entities and relationships are defined
- TypeORM configuration is complete
- Basic hello controller exists as a placeholder
- Authentication, controllers, and business logic are not yet implemented

### Key Dependencies
- `@nestjs/core` - Core NestJS framework
- `@nestjs/typeorm` - TypeORM integration
- `@nestjs/config` - Configuration management
- `typeorm` - Database ORM
- `pg` - PostgreSQL driver
- `dotenv` - Environment variable management

### Development Notes
- The application is currently on branch `intern/sayon/task-3`
- Database synchronization is disabled - use migrations for schema changes
- Environment configuration uses `.env.development` file
- The application runs on port 3000 by default (or from PORT environment variable)