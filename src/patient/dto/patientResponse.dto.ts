import { Sex } from "src/entities/Patient.entity";

export class PatientResponseDTO{
    patient_id : number;
    phone_number : string | null;
    age: number | null;
    sex: Sex | null;
    weight: number | null;
    first_name:string;
    last_name:string;
    email:string;
}