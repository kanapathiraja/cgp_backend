import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinColumn, ManyToOne } from "typeorm";
import { Users } from "./users.entity";

@Entity({name: "user_details"})
export class UserDetails {

    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;

    @Column({ type: "varchar", name: "title" })
    title: string;

    @Column({ type: "varchar", name: "designation" })
    designation: string;

    @Column({ type: "varchar", name: "mobile", nullable: true })
    mobile: string;

    @CreateDateColumn({type: "timestamp", name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp", name: "updated_at"})
    updatedAt: Date;

    @Column({ type: "integer", name: "status", default: 1 })
    status: number;

    @ManyToOne(type => Users)
    @JoinColumn({name: 'user_id', referencedColumnName: 'id'})
    user: Users;

}
