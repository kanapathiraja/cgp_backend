
import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn} from "typeorm";

@Entity({name: "client"})
export class Client{

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "text", name: "client_name" })
    clientName: string;

    @Column({ type: "boolean", name: "active_flag", default: false })
    activeFlag: boolean;

    @CreateDateColumn({type: "timestamp", name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp", name: "updated_at"})
    updatedAt: Date;

    // 0 = INACTIVE , 1 = ACTIVE 
    @Column({ type: "integer", name: "status", default: 1 })
    status: number; 

    
}
