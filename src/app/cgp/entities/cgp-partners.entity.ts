import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Cgp } from "./cgp.entity";

@Entity({name: "cgp_partners"})
export class CgpPartners {

    @PrimaryGeneratedColumn("uuid", {name: "id"}) 
    id: string;

    @IsNotEmpty()
    @Column({ name: "partner_id" })
    partnerId: string;

    @CreateDateColumn({type: "timestamp", name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp", name: "updated_at"})
    updatedAt: Date;

    // 0 = INACTIVE , 1 = ACTIVE 
    @Column({ type: "integer", name: "status", default: 1 })
    status: number; 
    
    @ManyToOne(type => Cgp, cgp => cgp.cgpPartners)
    @JoinColumn([{ name: 'cgp_id' }, { name: 'id' }])
    cgp: Cgp;


}
