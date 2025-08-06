
# Schedula Debugging Dynamos Backend

<img width="91" height="20" alt="image" src="https://github.com/user-attachments/assets/52023fea-cfcb-480f-b08b-60e94692a92f" />
<img width="113" height="20" alt="image" src="https://github.com/user-attachments/assets/67a426d9-ec36-4df9-9403-388fcbf06be4" />
<img width="125" height="20" alt="image" src="https://github.com/user-attachments/assets/63b9acbd-052e-4dc5-8979-0b2ce1566dd9" />
<img width="120" height="20" alt="image" src="https://github.com/user-attachments/assets/3f7e1b5a-9344-40d8-bf0a-16d138ecf60b" />


A scalable, modular backend API for a Hospital Appointment Scheduling System, built with NestJS, TypeScript, and PostgreSQL. 
This project forms the backbone of an advanced appointment platform, enabling seamless management of users, doctors, patients, and appointments.

### 🚀 Key features include:

#### Elastic Scheduling: Doctors can dynamically shrink or expand their available sessions, allowing for real-time adjustments based on demand or unforeseen changes.

#### Wave Scheduling: Supports advanced scheduling strategies such as wave scheduling, enabling multiple patients to be booked within the same time slot, optimizing clinic workflow and reducing patient wait times.

#### Role-Based Access: Secure authentication and authorization for doctors, patients, and administrators.

#### Robust User Management: Comprehensive APIs for managing doctor and patient profiles, appointment bookings, and notifications.

#### Scalable Architecture: Built with modular NestJS design principles, ensuring maintainability and easy extensibility for future features.

#### This backend is designed to power modern healthcare appointment systems, providing flexibility, efficiency, and reliability for both clinics and patients.

### 📦 Tech Stack

NestJS (v9+)
TypeScript (v4+)
PostgreSQL (v15+)
TypeORM or Prisma (ORM for PostgreSQL)
JWT for authentication
Nodemailer for emails
Swagger for API docs
dotenv for environment variables


### 🛠️ Installation

#### 1. Clone the Repository

````json

git clone https://github.com/PearlThoughtsInternship/Schedula_Debugging_Dynamos_Backend.git
cd Schedula_Debugging_Dynamos_Backend
git checkout intern/sayon-main

````

### 2. Install Dependencies

````json

npm install

````

### 3. Set Up Environment Variables

Create a .env file in the root directory:

````json

DATABASE_URL=postgresql://username:password@localhost:5432/schedula_db
DB_TYPE=postgres
DB_PORT=5432
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_NAME=your_db_name
DB_SYNC=false
DB_AUTOLOAD=true
DB_RUN_MIGRATIONS=false

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=token_expiry_time

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
Tip: See .env.example for a template.
````

### 🗄️ Database Setup

Create a PostgreSQL database (e.g., schedula_db).

Run migrations (if using TypeORM):

#### TypeORM:

````json

npm run typeorm migration:run

````

#### Prisma:

````json

npx prisma migrate deploy
````

### 🏃‍♂️ Running the Server

#### Development

````json

npm run start:dev
````

#### Production

````json

npm run build
npm run start:prod
The server will start on http://localhost:3000 (or your specified PORT).
````

#### 🧩 Project Structure

#### Modules

Authentication
Doctor
Patient
Appointment
Elastic Scheduling

### 📚 API Documentation

API docs are auto-generated with Swagger.

After running the server, visit:

````json
http://localhost:3000/api
````

### 🧪 Testing API Endpoints

You can use Postman or cURL.

#### Example: Register a User

POST /auth/register
Content-Type: application/json
````json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourpassword"
}
````

#### Example: Login

POST /auth/login
Content-Type: application/json

````json
{
  "email": "john@example.com",
  "password": "yourpassword"
}
````

#### Example: Get All Events (Authenticated)

GET /events
Authorization: Bearer <your_jwt_token>
See Swagger docs for all endpoints, request/response formats, and error codes.

➕ Adding Dependencies
To add a new dependency:

````json

npm install <package-name>
To add a dev dependency:

````json

npm install --save-dev <package-name>
🧹 Linting & Formatting
Lint:
````json

npm run lint
Format:
````json

npm run format
````

### 🧑‍💻 Contributing

Fork the repository
Create your feature branch (git checkout -b feature/YourFeature)
Commit your changes (git commit -m 'Add some feature')
Push to the branch (git push origin feature/YourFeature)
Open a Pull Request

### 🛡️ License

This project is licensed under the Happy Coding License.

### 🙋‍♂️ Support

For any queries or issues, please open an issue or contact the maintainer.

## Happy Coding! 🚀
