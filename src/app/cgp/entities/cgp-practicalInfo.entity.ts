import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { IsNotEmpty } from "class-validator";
import { Cgp } from "./cgp.entity";

@Entity({name: "cgp_practical_info"})
export class CgpPracticalInfo {

    @PrimaryGeneratedColumn("uuid", {name: "id"}) 
    id: string;

    @IsNotEmpty()
    @Column({ type: "text", name: "day_name" })
    dayName: string;

    @Column({ type: "text", name: "start_time" })
    startTime: string;

    @Column({ type: "text", name: "end_time" })
    endTime: string;

    @CreateDateColumn({type: "timestamp", name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp", name: "updated_at"})
    updatedAt: Date;

    // 0 = INACTIVE , 1 = ACTIVE 
    @Column({ type: "integer", name: "status", default: 1 })
    status: number; 
    
    @ManyToOne(type => Cgp, cgp => cgp.cgpPracticalInfo)
    @JoinColumn([{ name: 'cgp_id' }, { name: 'id' }])
    cgp: Cgp;



    

}
