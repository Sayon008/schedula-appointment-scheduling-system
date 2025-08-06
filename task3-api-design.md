# - API EndPoint Design Documentation

## Overview:-
This document outlines the API design for Schedula, a healthclinic appointment scheduling system. The APIs support authentication, user management, doctor profiles, patient profiles, appointment booking

## 1.Authentication APIs

### 1.1 User Signup

#### User Registration

HTTP Method: POST

Endpoint: /auth/signup

Request Body:
```json
{
  "username": "string",
  "email": "string",
  "password": "string",
  "firstName": "string",
  "lastName": "string",
  "profile_photo": "string",
  "role":"doctor"   //we can add either doctor or patient
}
```

Headers: Content-Type: application/json

Response (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role":"doctor"
  },
  "token": "jwt_token"
}
```

Error Cases:
```
400: Invalid input data, email already exists
422: Validation errors (password too weak, invalid email format)
500: Internal server error
```
Auth Required: No

Validation Notes: 
Email: Email must be valid format, 
Password: password minimum 8 characters, 
Username: username must be unique

### 1.2 User Login

#### User Login

HTTP Method: POST

Endpoint: /auth/login

Request Body:
```json
{
  "email": "string",
  "password": "string"
}
```

Headers: Content-Type: application/json

Response (200):
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "token": "jwt_token"
}
```

Error Cases:
```
401: Invalid credentials
400: Missing required fields
500: Internal server error
```
Auth Required: No

Validation Notes: Both email and password are required.

### 1.3 User Logout

#### User Logout

HTTP Method: POST

Endpoint: /auth/logout

Request Body: None

Headers: Authorization: Bearer Token

Response (200):
```json
{
  "success": true,
  "message": "Logout successful"
}
```

Error Cases:
```
401: Invalid or expired token
500: Internal server error
```
Auth Required: Yes

Validation Notes: Valid JWT token required

## 2.Doctor Profile APIs

### 2.1 Create Doctor Profile

#### Create Doctor Profile

HTTP Method: POST

Endpoint: /doctors

Request Body:
```json
{
  "specialization": "string",
  "years_of_exp": "integer",
  "time_slots": ["string array with time ranges"]
}
```

Headers: Authorization: Bearer Token

Response (201):
```json
{
  "success": true,
  "message": "Doctor profile created successfully",
  "doctor": {
    "doctor_id": "uuid",
    "specialization": "string",
    "years_of_exp": "integer",
    "time_slots": ["array"],
    "user_info": {
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    }
  }
}
```
Error Cases:
```
400: Invalid input data
401: Unauthorized
409: Doctor profile already exists for this user
500: Internal server error
```
Auth Required: Yes

Validation Notes: Only authenticated users can create a profile

Specialization required

Years of experience must be a positive integer

### 2.2 Get Doctor Profile

#### Get Doctor Profile

HTTP Method: GET

Endpoint: /doctors/{doctor_id}

Request Body: None

Headers: Authorization: Bearer Token

Response (200):
```json
{
  "success": true,
  "doctor": {
    "doctor_id": "uuid",
    "specialization": "string",
    "years_of_exp": "integer",
    "time_slots": ["array"],
    "user_info": {
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    }
  }
}
```
Error Cases:
```
401: Unauthorized
404: Doctor not found
500: Internal server error
```
Auth Required: Yes

Validation Notes: Valid doctor_id required

### 2.3 Update Doctor Profile

#### Update Doctor Profile

HTTP Method: PATCH

Endpoint: /doctors/{doctor_id}

Request Body:
```json
{
  "specialization": "string (optional)",
  "years_of_exp": "integer (optional)",
  "time_slots": ["array (optional)"]
}
```
Headers: Authorization: Bearer Token

Response (200):
```json
{
  "success": true,
  "message": "Doctor profile updated successfully",
  "doctor": {
    "doctor_id": "uuid",
    "specialization": "string",
    "years_of_exp": "integer",
    "time_slots": ["array"]
  }
}
```
Error Cases:
```
400: Invalid input data
401: Unauthorized
403: Not authorized to update this profile
404: Doctor not found
500: Internal server error
```
Auth Required: Yes

Validation Notes: Only profile owner can update, at least one field required

## 3.Patient Profile APIs

### 3.1 Create Patient Profile

#### Create Patient Profile

HTTP Method: POST

Endpoint: /patients

Request Body:
```json
{
  "phone_number": "string",
  "weight": "integer"
}
```
Headers: Authorization: Bearer Token

Response (201):
```json
{
  "success": true,
  "message": "Patient profile created successfully",
  "patient": {
    "patient_id": "uuid",
    "phone_number": "string",
    "weight": "integer",
    "user_info": {
      "firstName": "string",
      "lastName": "string",
      "email": "string"
    }
  }
}
```
Error Cases:
```
400: Invalid input data
401: Unauthorized
409: Patient profile already exists for this user
500: Internal server error
```
Auth Required: Yes

Validation Notes: Valid phone number format, weight must be a positive integer

### 3.2 Get Patient Profile

#### Get Patient Profile

HTTP Method: GET

Endpoint: /patients/{patient_id}

Request Body: None

Headers: Authorization: Bearer Token

Response (200):
```json
{
  "success": true,
  "patient": {
    "patient_id": "uuid",
    "phone_number": "string",
    "weight": "integer",
    "user_info": {
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "age": "integer"
    }
  }
}
```
Error Cases:
```
401: Unauthorized
404: Patient not found
500: Internal server error
```
Auth Required: Yes

Validation Notes: Valid patient_id required

## 4.Appointment Booking APIs

### 4.1 Create Appointment

#### Book Appointment

HTTP Method: POST

Endpoint: /appointments

Request Body:
```json
{
  "doctor_id": "uuid",
  "appointment_time": "2024-01-15T10:00:00Z",
  "visitType": "string",
  "complaint": "string",
  "complaint_details": "string"
}
```
Headers: Authorization: Bearer Token

Response (201):
```json
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment": {
    "appointment_id": "uuid",
    "doctor_id": "uuid",
    "patient_id": "uuid",
    "appointment_time": "2024-01-15T10:00:00Z",
    "visitType": "string",
    "complaint": "string",
    "complaint_details": "string"
  }
}
```
Error Cases:
```
400: Invalid input data, time slot not available
401: Unauthorized
404: Doctor not found
409: Time slot already booked
500: Internal server error
```
Auth Required: Yes

Validation Notes: Doctor must exist, appointment time must be in future, time slot must be available

### 4.2 Get Appointment Details

#### Get Appointment Details

HTTP Method: GET

Endpoint: /appointments/{appointment_id}

Request Body: None

Headers: Authorization: Bearer Token

Response (200):
```json
{
  "success": true,
  "appointment": {
    "appointment_id": "uuid",
    "appointment_time": "2024-01-15T10:00:00Z",
    "visitType": "string",
    "complaint": "string",
    "complaint_details": "string",
    "chat": "jsonb",
    "feedback": "string",
    "created_at": "2024-01-10T08:00:00Z",
    "updated_at": "2024-01-10T08:00:00Z",
    "doctor_info": {
      "doctor_id": "uuid",
      "name": "string",
      "specialization": "string"
    },
    "patient_info": {
      "patient_id": "uuid",
      "name": "string",
      "age": "integer"
    }
  }
}
```
Error Cases:
```
401: Unauthorized
403: Not authorized to view this appointment
404: Appointment not found
500: Internal server error
```
Auth Required: Yes

Validation Notes: User must be either the patient or doctor involved in the appointment

### 4.3 Update Appointment

#### Update Appointment Details

HTTP Method: PATCH

Endpoint: /appointments/{appointment_id}

Headers: Authorization: Bearer Token

Response (200):
```json
{
  "success": true,
  "message": "Appointment updated successfully",
  "appointment": {
    "appointment_id": "uuid",
    "appointment_time": "2024-01-15T10:00:00Z",
    "visitType": "string",
    "complaint": "string",
    "complaint_details": "string",
    "feedback": "string",
    "updated_at": "2024-01-10T08:00:00Z"
  }
}
```
Errors: 
```
401: Unauthorized
403: Not authorized to update this appointment
404: Appointment not found
409: New time slot already booked
500: Internal server error
```
Auth Required: Yes

Validation Notes: Only patient or doctor can update their own appointments, at least one field required

### 4.4 Cancel Appointment

#### Cancel An Appointment

Endpoint : /appointments/{appointment_id}

HTTP Method: DELETE

Request Body: None

Headers: Authorization: Bearer Token

Response (200):
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```
Errors:
```
401: Unauthorized
403: Not authorized to cancel this appointment
404: Appointment not found
500: Internal server error
```
Auth Required: Yes

Validation Notes: Only patient or doctor can cancel their own appointments

## 5.Availability Management APIs

### 5.1 Get Doctor Availability

#### Get Doctor Available Slots

HTTP Method: GET

Endpoint: /doctors/{doctor_id}/availability

Request Body: None

Headers: Authorization: Bearer token

Response (200):
```json
{
   "success": true,
   "doctor_id": "uuid",
   "available_slots": [
      {
         "date": "2024-01-15",
         "time_slots": ["10:00", "11:00", "14:00", "15:00"]
      }
   ]
}
```
Error Cases:
```
401: Unauthorized
404: Doctor not found
500: Internal server error
Auth Required: Yes
```
Validation Notes: Valid doctor_id required

### 5.2 Update Doctor Availability

#### Update Doctor Time Slots

HTTP Method: PATCH

Endpoint: /doctors/{doctor_id}/availability

Request Body:
```json
{
   "time_slots": ["09:00-17:00", "19:00-21:00"]
}
```
Headers: Authorization: Bearer token 

Response (200):
```json
{
   "success": true,
   "message": "Availability updated successfully",
   "doctor_id": "uuid",
   "time_slots": ["09:00-17:00", "19:00-21:00"]
}
```
Error Cases:
```
400: Invalid time format
401: Unauthorized
403: Not authorized to update this doctor's availability
404: Doctor not found
500: Internal server error
```
Auth Required: Yes

Validation Notes: Only the doctor can update their own availability, valid time format required