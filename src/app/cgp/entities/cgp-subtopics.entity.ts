import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Cgp } from "./cgp.entity";
import { Specialties } from "./specialties.entity";
import { Subtopics } from "./subtopics.entity";

@Entity({name: "cgp_subtopics"})
export class CgpSubtopics {

    @PrimaryGeneratedColumn("uuid", {name: "id"})
    id: string;   

    @CreateDateColumn({type: "timestamp", name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp", name: "updated_at"})
    updatedAt: Date;

    // 0 = INACTIVE , 1 = ACTIVE
    @Column({ type: "integer", name: "status", default: 1 })
    status: number;

    @ManyToOne(type => Cgp, cgp => cgp.cgpSubtopics)
    @JoinColumn({name: 'cgp_id', referencedColumnName: 'id'})
    cgp: Cgp;

    @ManyToOne(
      (type) => Subtopics,
      (subtopics) => subtopics.cgpSubtopics,
    )
    @JoinColumn({ name: 'subtopic_id', referencedColumnName: 'id'})
    subtopics: Subtopics;
}
