import { Column, Entity, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from "typeorm";
import { IsEmail, IsNotEmpty } from "class-validator";
import * as bcrypt from 'bcryptjs';
import { UserDetails } from "./users-details.entity";
import { Cgp } from "src/app/cgp/entities/cgp.entity";
import { Appointments } from "../../appointment/entities/appointment.entity";

export enum Role {
    USER = "USER",
    CGP = "CGP",
    ADMIN = "ADMIN",
    SUPERADMIN = "SUPERADMIN"
}

export enum Gender {
    MALE = "MALE",
    FEMALE = "FEMALE",
    OTHERS = "OTHERS",
    NULL = "null",
}

@Entity({name: "users"})
export class Users {

    @PrimaryGeneratedColumn("uuid", {name: "id"}) 
    id: string;

    @Column({ name: "first_name", length: 100})
    firstName: string;

    @Column({ name: "last_name", length: 50, nullable: true})
    lastName: string;

    @IsEmail()
    @Column({ name: "email", length: 100, unique: true })
    email: string;

    @IsNotEmpty()
    @Column({ type: "text", name: "password" })
    password: string;

    @BeforeInsert()
    async hashPassword() {
        this.password = bcrypt.hashSync(this.password, 10);
    } 

    @Column({ name: "role", type: "enum", enum: Role, default: Role.USER })
    role: Role;

    @Column({ name: "gender", type: "enum", enum: Gender, default: Gender.NULL })
    gender: Gender;

    @Column({ name: "function", type: "varchar", nullable: true})
    function: string;

    @Column({ type: "text", name: "profile_image", nullable: true })
    profileImage: string;

    @Column({ type: "integer", name: "password_flag", default: 0 })
    passwordFlag: number;
   
    @Column({ type: "integer", name: "email_verify", default: 0 })
    emailVerify: number;
    
    @CreateDateColumn({type: "timestamp", name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp", name: "updated_at"})
    updatedAt: Date;

    // 0 = INACTIVE , 1 = ACTIVE 
    @Column({ type: "integer", name: "status", default: 1 })
    status: number;  
    
    @OneToMany(type => UserDetails, userDetails => userDetails.user)
    userDetails: UserDetails[];

    @OneToMany(type => Cgp, cgp => cgp.users)
    cgp: Cgp[];

    @OneToMany(type => Appointments, appointments => appointments.users)
    appointments: Appointments[];

}
