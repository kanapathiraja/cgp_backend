import { Column, Entity, PrimaryGeneratedColumn, BeforeInsert, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, Generated } from "typeorm";


@Entity({name: "mail_template"})
export class MailTemplate {

    @PrimaryGeneratedColumn("uuid", { name: "id" }) 
    id: string;

    @Column({ type: "text", name: "template_code", unique: true, nullable: true })
    templateCode: string;

    @Column({ type: "text", name: "template_name", nullable: true})
    templateName: string;

    @Column({ type: "text", name: "subject", nullable: true})
    subject: string;

    @Column({ type: "text", name: "content", nullable: true})
    content: string;

    @CreateDateColumn({type: "timestamp", name: "created_at"})
    createdAt: Date;

    @UpdateDateColumn({type: "timestamp", name: "updated_at"})
    updatedAt: Date;

    // 0 = INACTIVE , 1 = ACTIVE 
    @Column({ type: "integer", name: "status", default: 1 })
    status: number;  

}
